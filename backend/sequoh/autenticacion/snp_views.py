from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.status import HTTP_200_OK, HTTP_403_FORBIDDEN
from .models import SNP
from django.db.models import Case, When, IntegerField


class VariantesAPIView(APIView):
    """
    Vista API para obtener todas las variantes SNP de la base de datos.
    Accesible por cualquiera (DEBUG MODE).
    """
    permission_classes = [AllowAny]

    def get(self, request):
        """
        Retorna todas las variantes SNP de la base de datos.
        """
        try:
            # Priorizar registros de Chile y luego de América
            priority_order = Case(
                When(pais__iexact='Chile', then=0),
                When(continente__icontains='america', then=1),
                When(poblacion_pais__isnull=False, then=2),
                When(pais__isnull=False, then=3),
                default=4,
                output_field=IntegerField()
            )

            # Anotar con la prioridad y ordenar
            snps = SNP.objects.annotate(
                priority=priority_order
            ).order_by('rsid', 'priority').values(
                'id',
                'rsid',
                'cromosoma',
                'posicion',
                'genotipo',
                'fenotipo',
                'categoria',
                'alelo_referencia',
                'alelo_alternativo',
                'nivel_riesgo',
                'magnitud_efecto',
                'fuente_base_datos',
                'tipo_evidencia',
                'fecha_actualizacion',
                # Ancestry data - Continent
                'continente',
                'af_continente',
                'fuente_continente',
                'poblacion_continente',
                # Ancestry data - Country
                'pais',
                'af_pais',
                'fuente_pais',
                'poblacion_pais',
            )


            # Convertir a lista para serialización
            variantes_list = list(snps)

            return Response({
                'success': True,
                'count': len(variantes_list),
                'data': variantes_list
            }, status=HTTP_200_OK)

        except Exception as e:
            print(f"[ERROR] Exception in GET VariantesAPIView: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'error': str(e)
            }, status=HTTP_200_OK)

    def post(self, request):
        """
        Crea una nueva variante SNP en la base de datos.
        """
        try:
            data = request.data
            print(f"[DEBUG POST] Incoming data: {data}")
            
            # Validar campos requeridos
            required_fields = ['rsid', 'genotipo', 'fenotipo']
            for field in required_fields:
                if field not in data or not data[field]:
                    return Response({
                        'success': False,
                        'error': f'Campo requerido faltante: {field}'
                    }, status=HTTP_200_OK)
            
            # Crear nuevo SNP
            snp = SNP.objects.create(
                rsid=data.get('rsid', ''),
                genotipo=data.get('genotipo', ''),
                fenotipo=data.get('fenotipo', ''),
                categoria=data.get('categoria', ''),
                cromosoma=data.get('cromosoma', ''),
                posicion=data.get('posicion'),
                alelo_referencia=data.get('alelo_referencia', ''),
                alelo_alternativo=data.get('alelo_alternativo', ''),
                nivel_riesgo=data.get('nivel_riesgo', ''),
                magnitud_efecto=data.get('magnitud_efecto'),
                fuente_base_datos=data.get('fuente_base_datos', ''),
                tipo_evidencia=data.get('tipo_evidencia', ''),
                fecha_actualizacion=data.get('fecha_actualizacion', ''),
                # Ancestry data - Continent
                continente=data.get('continente', ''),
                af_continente=data.get('af_continente'),
                fuente_continente=data.get('fuente_continente', ''),
                poblacion_continente=data.get('poblacion_continente', ''),
                # Ancestry data - Country
                pais=data.get('pais', ''),
                af_pais=data.get('af_pais'),
                fuente_pais=data.get('fuente_pais', ''),
                poblacion_pais=data.get('poblacion_pais', ''),
            )
            
            print(f"[SUCCESS] New SNP created with ID: {snp.id}")
            
            return Response({
                'success': True,
                'message': 'Variante creada exitosamente',
                'data': {
                    'id': snp.id,
                    'rsid': snp.rsid,
                    'genotipo': snp.genotipo,
                    'fenotipo': snp.fenotipo,
                    'categoria': snp.categoria,
                }
            }, status=HTTP_200_OK)
        
        except Exception as e:
            print(f"[ERROR] Exception in POST VariantesAPIView: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'error': str(e)
            }, status=HTTP_200_OK)
