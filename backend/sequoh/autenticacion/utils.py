import os
import uuid
from urllib.parse import unquote

from django.conf import settings
from django.contrib.staticfiles import finders
from django.utils import timezone
from .models import Profile, RsidExtraInfo

def ensure_sample_code(profile: Profile) -> str:
    """Genera un SampleCode si no existe."""
    if profile.sample_code:
        return profile.sample_code
    code = f"SC-{profile.user_id:05d}-{uuid.uuid4().hex[:5].upper()}"
    profile.sample_code = code
    profile.sample_code_created_at = timezone.now()
    profile.save(update_fields=["sample_code", "sample_code_created_at"])
    return code

from io import BytesIO
from django.http import HttpResponse
from django.template.loader import get_template
from xhtml2pdf import pisa


def link_callback(uri, rel):
    """
    Convierte URIs a rutas de archivo locales para xhtml2pdf.
    """
    if uri.startswith("file://"):
        path = unquote(uri[7:])
        if os.name == "nt" and path.startswith("/"):
            path = path[1:]
        return path

    static_url = getattr(settings, "STATIC_URL", None)
    if static_url and uri.startswith(static_url):
        path = finders.find(uri.replace(static_url, ""))
        if path:
            return path

    media_url = getattr(settings, "MEDIA_URL", None)
    media_root = getattr(settings, "MEDIA_ROOT", None)
    if media_url and media_root and uri.startswith(media_url):
        return os.path.join(media_root, uri.replace(media_url, ""))

    if os.path.isabs(uri):
        return uri

    return uri

def render_to_pdf(template_src, context_dict={}):
    """
    Renderiza un template HTML a PDF y devuelve un HttpResponse con el PDF.
    """
    template = get_template(template_src)
    html  = template.render(context_dict)
    result = BytesIO()
    # Usamos UTF-8 para evitar problemas de codificación con caracteres especiales
    pdf = pisa.pisaDocument(BytesIO(html.encode("UTF-8")), result, link_callback=link_callback)
    if not pdf.err:
        return HttpResponse(result.getvalue(), content_type='application/pdf')
    return None


def build_rsid_extra_info_map(snps):
    rs_ids = set()
    genotypes = set()
    phenotypes = set()

    for snp in snps:
        if not snp:
            continue
        if snp.rsid:
            rs_ids.add(snp.rsid)
        if snp.genotipo:
            genotypes.add(snp.genotipo)
        phenotype = (snp.fenotipo or "N/D").strip() or "N/D"
        phenotypes.add(phenotype)

    if not rs_ids or not genotypes or not phenotypes:
        return {}

    extras = RsidExtraInfo.objects.filter(
        rs_id__in=rs_ids,
        genotype__in=genotypes,
        phenotype_name__in=phenotypes,
    )
    return {(row.rs_id, row.genotype, row.phenotype_name): row for row in extras}
