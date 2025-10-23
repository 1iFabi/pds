from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .authentication import JWTAuthentication
from .models import UserSNP, SNP
from collections import defaultdict


@method_decorator(csrf_exempt, name='dispatch')
class DiseasesAPIView(APIView):
    """
    Retorna las enfermedades y sus SNPs asociados al usuario autenticado.
    Agrupa por enfermedad y prioriza por nivel de importancia.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Obtener todos los SNPs de enfermedades del usuario
        user_snps = UserSNP.objects.filter(
            user=user,
            snp__categoria='enfermedades'
        ).select_related('snp')
        
        # Organizar SNPs por prioridad
        snps_by_priority = {
            'alta': [],
            'media': [],
            'baja': []
        }
        
        for user_snp in user_snps:
            snp = user_snp.snp
            importancia = snp.importancia or 1
            
            snp_obj = {
                'rsid': snp.rsid,
                'genotipo': snp.genotipo,
                'fenotipo': snp.fenotipo,
                'importancia': importancia,
                'nivel_riesgo': self._get_risk_level(importancia)
            }
            
            # Clasificar por prioridad
            # Alta: 4 y 5, Media: 3, Baja: 1 y 2
            if importancia >= 4:
                snps_by_priority['alta'].append(snp_obj)
            elif importancia == 3:
                snps_by_priority['media'].append(snp_obj)
            else:
                snps_by_priority['baja'].append(snp_obj)
        
        # Ordenar cada categoría por importancia descendente
        for priority in snps_by_priority:
            snps_by_priority[priority].sort(
                key=lambda x: x['importancia'],
                reverse=True
            )
        
        return Response({
            'success': True,
            'data': snps_by_priority
        })
    
    def _get_risk_level(self, importancia):
        """
        Determina el nivel de riesgo basado en la importancia.
        Alta: 4 y 5, Media: 3, Baja: 1 y 2
        """
        if importancia >= 4:
            return 'Moderado-Alto'
        elif importancia == 3:
            return 'Moderado'
        else:
            return 'Bajo'
