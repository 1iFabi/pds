from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .authentication import JWTAuthentication
from .models import UserSNP, PharmacogeneticSystem, SNP

class PharmacogeneticsAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # Obtener los sistemas ordenados por ID o nombre
        systems = PharmacogeneticSystem.objects.all().order_by('id')
        
        # Colores para los sistemas siguiendo el diseño del frontend
        system_colors = {
            'Cardiología': '#F48FB1',
            'Salud Mental y Neurología': '#00BCD4',
            'Gastroenterología': '#9C27B0',
            'Salud Ósea y Reumatología': '#3F51B5',
            'Oncología': '#FF5722'
        }

        # Obtener los SNPs del usuario de categoría farmacogenética
        user_snps = UserSNP.objects.filter(
            user=user, 
            snp__categoria__icontains='farmaco'
        ).select_related('snp', 'snp__pharmacogenetic_system')

        result = []
        for system in systems:
            system_snps = [us.snp for us in user_snps if us.snp.pharmacogenetic_system_id == system.id]
            
            drugs = []
            for snp in system_snps:
                # Intentamos limpiar el fenotipo para mostrar el nombre del fármaco
                # El fenotipo suele ser "Metabolizador lento de warfarina (CYP2C9)"
                raw_fenotipo = snp.fenotipo
                name = raw_fenotipo.split('(')[0].strip()
                
                # Heurística de limpieza para el nombre del fármaco
                prefixes_to_remove = [
                    "metabolizador lento de ", "metabolizador pobre de ",
                    "metabolizador intermedio de ", "metabolizador ultra-rápido de ",
                    "metabolizador normal de ", "metabolizador extenso de ",
                    "metabolismo reducido de ", "metabolismo muy reducido de ",
                    "metabolismo normal de ", "metabolismo intermedio de ",
                    "respuesta intermedia a ", "respuesta reducida a ",
                    "respuesta óptima a ", "respuesta estándar a ",
                    "mayor respuesta a ", "menor respuesta a ",
                    "metabolismo de ", "metabolismo "
                ]
                
                cleaned_name = name.lower()
                for prefix in prefixes_to_remove:
                    if cleaned_name.startswith(prefix):
                        cleaned_name = cleaned_name.replace(prefix, "")
                        break
                
                cleaned_name = cleaned_name.capitalize()

                drugs.append({
                    "name": cleaned_name,
                    "percentage": int((float(snp.magnitud_efecto or 1.5) / 3.0) * 100),
                    "rsid": snp.rsid,
                    "cromosoma": snp.cromosoma,
                    "posicion": str(snp.posicion or ""),
                    "genotipo": snp.genotipo,
                    "magnitud": float(snp.magnitud_efecto or 1.5),
                    "fenotipo": raw_fenotipo
                })

            result.append({
                "name": system.name,
                "role": system.description or f"Análisis de fármacos para {system.name}",
                "color": system_colors.get(system.name, '#607D8B'),
                "drugs": drugs
            })

        return Response({
            "success": True,
            "data": result
        })
