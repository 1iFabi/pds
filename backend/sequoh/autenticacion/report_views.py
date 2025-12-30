import base64
import struct
from pathlib import Path

from django.conf import settings
from django.http import HttpResponse
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Profile, UserSNP
from .utils import render_to_pdf

def _extract_png_from_ico(path: Path):
    try:
        data = path.read_bytes()
    except OSError:
        return None

    if len(data) < 6:
        return None
    reserved, icon_type, count = struct.unpack_from("<HHH", data, 0)
    if reserved != 0 or icon_type != 1 or count == 0:
        return None

    best = None
    png_sig = b"\x89PNG\r\n\x1a\n"
    for i in range(count):
        entry_offset = 6 + i * 16
        if entry_offset + 16 > len(data):
            break
        width, height, _colors, _reserved, _planes, _bitcount, size, offset = struct.unpack_from(
            "<BBBBHHII",
            data,
            entry_offset,
        )
        end = offset + size
        if end > len(data):
            continue
        image = data[offset:end]
        if not image.startswith(png_sig):
            continue
        w = 256 if width == 0 else width
        h = 256 if height == 0 else height
        area = w * h
        if best is None or area > best[0]:
            best = (area, image)

    return best[1] if best else None


class UserReportPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        # Optimizar consulta con select_related para traer los datos del SNP asociado
        snps = UserSNP.objects.filter(user=user).select_related('snp')
        profile = Profile.objects.filter(user=user).only("rut").first()
        
        logo_uri = None
        logo_ico_path = settings.BASE_DIR.parent.parent / "frontend" / "public" / "Logo.ico"
        if logo_ico_path.exists():
            logo_png = _extract_png_from_ico(logo_ico_path)
            if logo_png:
                logo_data = base64.b64encode(logo_png).decode("ascii")
                logo_uri = f"data:image/png;base64,{logo_data}"

        if not logo_uri:
            logo_candidates = [
                settings.BASE_DIR.parent.parent / "frontend" / "public" / "logo512.png",
                settings.BASE_DIR.parent.parent / "frontend" / "public" / "logo192.png",
            ]
            logo_path = next((path for path in logo_candidates if path.exists()), None)
            if logo_path:
                logo_data = base64.b64encode(logo_path.read_bytes()).decode("ascii")
                logo_uri = f"data:image/png;base64,{logo_data}"

        data = {
            'user': user,
            'profile': profile,
            'snps': snps,
            'fecha': timezone.now(),
            'logo_uri': logo_uri,
        }
        
        pdf_response = render_to_pdf('reporte_genetico.html', data)
        
        if pdf_response:
            filename = f"Reporte_Genetico_{user.username}.pdf"
            # 'attachment' fuerza la descarga, 'inline' lo abriría en el navegador
            pdf_response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return pdf_response
        return HttpResponse("Error al generar PDF", status=400)
