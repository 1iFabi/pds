from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .authentication import JWTAuthentication
from .models import UserSNP, PharmacogeneticSystem


class PharmacogeneticsAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        systems = list(PharmacogeneticSystem.objects.all().order_by('id'))
        base_colors = ['#F48FB1', '#00BCD4', '#9C27B0', '#3F51B5', '#FF5722', '#4CAF50', '#FFC107']
        system_colors = {}
        for idx, sys in enumerate(systems):
            system_colors[sys.name.lower()] = base_colors[idx % len(base_colors)]
        system_colors['otros'] = '#607D8B'

        pharm_filter = Q(snp__categoria__icontains='farmaco') | Q(snp__grupo__icontains='farmaco')
        user_snps = (
            UserSNP.objects.filter(user=user)
            .filter(pharm_filter)
            .select_related('snp', 'snp__pharmacogenetic_system')
        )

        system_map = {s.id: s for s in systems}
        buckets = {}

        prefixes = [
            "metabolizador lento de ", "metabolizador pobre de ",
            "metabolizador intermedio de ", "metabolizador ultra-rápido de ",
            "metabolizador normal de ", "metabolizador extenso de ",
            "metabolismo reducido de ", "metabolismo muy reducido de ",
            "metabolismo normal de ", "metabolismo intermedio de ",
            "respuesta intermedia a ", "respuesta reducida a ",
            "respuesta óptima a ", "respuesta estándar a ",
            "mayor respuesta a ", "menor respuesta a ",
            "metabolismo de ", "metabolismo ",
        ]

        heuristics = [
            ('Cardiologia', ['cardio', 'warfar', 'clopidogrel', 'estat', 'asa', 'aspirina', 'anticoag', 'antiagreg']),
            ('Salud Mental y Neurología', ['psiq', 'depres', 'ansied', 'neurol', 'ssri', 'snri', 'parox', 'sertral', 'fluox', 'antipsi']),
            ('Gastroenterologia', ['gastro', 'prazol', 'omepraz', 'pantopraz', 'reflujo', 'ulcera']),
            ('Salud Ósea y Reumatologia', ['osea', 'hueso', 'reuma', 'osteop', 'vit d', 'calcio']),
            ('Oncologia', ['onco', 'tumor', 'cancer', 'leucem', 'quimio', 'chemo']),
        ]

        def resolve_system(snp):
            if snp.pharmacogenetic_system_id:
                s = system_map.get(snp.pharmacogenetic_system_id)
                if s:
                    name = s.name
                    return name.lower(), name, s.description or f"Analisis de farmacos para {name}", system_colors.get(name.lower(), '#607D8B')
            text = " ".join([
                str(getattr(snp, 'grupo', '') or ''),
                str(getattr(snp, 'categoria', '') or ''),
                str(getattr(snp, 'fenotipo', '') or '')
            ]).lower()
            for name, keys in heuristics:
                if any(k in text for k in keys):
                    return name.lower(), name, f"Analisis de farmacos para {name}", system_colors.get(name.lower(), '#607D8B')
            return 'otros', 'Otros', 'Farmacos sin sistema asignado', system_colors.get('otros', '#607D8B')

        best_by_key = {}
        for us in user_snps:
            snp = us.snp
            if not snp:
                continue

            raw = (snp.fenotipo or "").strip()
            name = raw.split("(")[0].strip() or snp.rsid or "Farmaco"
            cleaned = name.lower()
            for pref in prefixes:
                if cleaned.startswith(pref):
                    cleaned = cleaned.replace(pref, "")
                    break
            cleaned_name = cleaned.capitalize() if cleaned else name

            sys_key, sys_name, sys_desc, sys_color = resolve_system(snp)

            try:
                magn = float(snp.magnitud_efecto) if snp.magnitud_efecto is not None else 1.5
            except Exception:
                magn = 1.5
            percentage = max(1, min(100, int((magn / 3.0) * 100)))

            dedup_key = (sys_key, cleaned_name.lower(), snp.rsid or "", snp.genotipo or "")
            current = best_by_key.get(dedup_key)
            if current is None or magn > current["magnitud"]:
                best_by_key[dedup_key] = {
                    "name": cleaned_name,
                    "percentage": percentage,
                    "rsid": snp.rsid,
                    "cromosoma": snp.cromosoma,
                    "posicion": str(snp.posicion or ""),
                    "genotipo": snp.genotipo,
                    "magnitud": magn,
                    "fenotipo": raw or cleaned_name,
                    "system_key": sys_key,
                    "system_name": sys_name,
                    "system_desc": sys_desc,
                    "system_color": sys_color,
                }

        for data in best_by_key.values():
            buckets.setdefault(data["system_key"], []).append(data)

        result = []
        for sys_key, drugs in buckets.items():
            if not drugs:
                continue
            meta = drugs[0]
            sys_name = meta.get("system_name", "Otros")
            sys_desc = meta.get("system_desc", "Farmacos sin sistema asignado")
            sys_color = meta.get("system_color", system_colors.get(sys_key, '#607D8B'))
            result.append({
                "name": sys_name,
                "role": sys_desc,
                "color": sys_color,
                "drugs": drugs,
            })

        return Response({"success": True, "data": result})
