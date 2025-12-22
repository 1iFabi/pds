from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from .authentication import JWTAuthentication
from .models import UserSNP, SNP
import sys


@method_decorator(csrf_exempt, name='dispatch')
class BiomarkersAPIView(APIView):
    """
    Retorna biomarcadores (SNPs) del usuario filtrando categoria/grupo que contenga 'biomarc'.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        print(f"BiomarkersAPIView: Fetching biomarkers for user {user.id} ({user.email})", file=sys.stdout)

        biom_filter = Q(snp__categoria__icontains="biomarc") | Q(snp__grupo__icontains="biomarc")
        user_snps = (
            UserSNP.objects.filter(user=user)
            .filter(biom_filter)
            .select_related("snp")
        )

        # Contar total global de biomarcadores disponibles en la base de datos
        global_filter = Q(categoria__icontains="biomarc") | Q(grupo__icontains="biomarc")
        global_total = SNP.objects.filter(global_filter).count()

        biomarkers = []
        risk_counts = {"bajo": 0, "medio": 0, "alto": 0}

        for us in user_snps:
            snp = us.snp
            if not snp:
                continue

            try:
                magnitude = float(snp.magnitud_efecto) if snp.magnitud_efecto is not None else None
            except (ValueError, TypeError):
                magnitude = None

            risk = (snp.nivel_riesgo or "").strip().lower()
            if risk in risk_counts:
                risk_counts[risk] += 1

            biomarkers.append({
                "id": snp.rsid,
                "rsid": snp.rsid,
                "gene": snp.grupo or snp.categoria or "NA",
                "name": snp.fenotipo or "Biomarcador",
                "chromosome": snp.cromosoma or "",
                "position": snp.posicion,
                "userGenotype": snp.genotipo,
                "alleles": {
                    "ref": snp.alelo_referencia,
                    "alt": snp.alelo_alternativo,
                },
                "userResult": {
                    "genotype": snp.genotipo,
                    "phenotype": snp.fenotipo,
                    "risk": risk or "medio",
                    "magnitude": magnitude,
                    "frequency": snp.af_pais or snp.af_continente,
                    "continent": snp.continente,
                    "country": snp.pais,
                },
            })

        return Response({
            "success": True,
            "total": len(biomarkers),
            "global_total": global_total,
            "risk_distribution": risk_counts,
            "biomarkers": biomarkers,
        })
