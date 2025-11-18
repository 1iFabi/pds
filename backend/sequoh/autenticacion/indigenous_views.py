from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db.models import Count, Sum, Q, F, Case, When, DecimalField
from .authentication import JWTAuthentication
from .models import UserSNP, SNP
from decimal import Decimal


@method_decorator(csrf_exempt, name='dispatch')
class IndigenousPeoplesAPIView(APIView):
    """
    Returns indigenous peoples ancestry data for Chile.
    Filters SNPs where country is Chile and analyzes indigenous population data.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Get all SNPs associated with user and filtered by Chile
        user_snps = UserSNP.objects.filter(
            user=user,
            snp__pais__iexact='Chile'
        ).select_related('snp')
        
        if not user_snps.exists():
            # Return default/empty data if no SNPs found for Chile
            return Response({
                'success': True,
                'data': {
                    'indigenous_peoples': [],
                    'total_variants': 0,
                    'message': 'No hay datos de pueblos indígenas disponibles.'
                }
            })
        
        # List of indigenous peoples to filter
        indigenous_peoples = ['Aimara', 'Atacameño', 'Diaguita', 'Mapuche', 'Rapa Nui']
        
        # Aggregate data by indigenous population
        indigenous_data = []
        total_count = 0
        
        for people in indigenous_peoples:
            people_snps = user_snps.filter(
                snp__poblacion_pais__iexact=people
            )
            
            count = people_snps.count()
            if count > 0:
                avg_freq = people_snps.aggregate(
                    avg=Sum('snp__af_pais') / Count('snp')
                )['avg'] or Decimal('0')
                
                indigenous_data.append({
                    'name': people,
                    'count': count,
                    'avg_allele_frequency': float(avg_freq)
                })
                total_count += count
        
        # Calculate percentages
        results = []
        for item in indigenous_data:
            percentage = round(float((item['count'] / total_count * 100) if total_count > 0 else 0), 2)
            results.append({
                'name': item['name'],
                'percentage': percentage,
                'variant_count': item['count'],
                'avg_allele_frequency': item['avg_allele_frequency']
            })
        
        # Sort by percentage descending
        results.sort(key=lambda x: x['percentage'], reverse=True)
        
        # Get total unique SNPs
        total_variants = user_snps.count()
        
        return Response({
            'success': True,
            'data': {
                'indigenous_peoples': results,
                'total_variants': total_variants,
                'country': 'Chile',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': f"{user.first_name} {user.last_name}".strip() or user.username
                }
            }
        })
