"""
Comando Django para enriquecimiento EXHAUSTIVO de TODOS los SNPs en la base de datos
Actualiza registros incompletos, genéricos y con "Medida antropométrica"
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from autenticacion.models import SNP
from complete_rsid_database import COMPLETE_RSID_DATABASE
from datetime import datetime


class Command(BaseCommand):
    help = 'Enriquecimiento exhaustivo de TODOS los SNPs incompletos o genéricos'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('=' * 80))
        self.stdout.write(self.style.WARNING('INICIANDO ENRIQUECIMIENTO MASIVO DE SNPs'))
        self.stdout.write(self.style.WARNING('=' * 80))
        
        # Estadísticas
        total_snps = SNP.objects.count()
        updated_count = 0
        errors = []
        
        self.stdout.write(f"\n📊 Total de SNPs en base de datos: {total_snps}")
        self.stdout.write(f"📚 RSIDs en base de datos de enriquecimiento: {len(COMPLETE_RSID_DATABASE)}")
        
        # Procesar TODOS los RSIDs en la base de datos de enriquecimiento
        for rsid, enrichment_data in COMPLETE_RSID_DATABASE.items():
            try:
                # Buscar el SNP en la base de datos
                snps = SNP.objects.filter(rsid=rsid)
                
                if not snps.exists():
                    self.stdout.write(self.style.WARNING(f"⚠️  {rsid} no encontrado en DB"))
                    continue
                
                # Actualizar TODOS los registros con este RSID
                for snp in snps:
                    needs_update = False
                    old_phenotype = snp.fenotipo
                    
                    # Verificar si necesita actualización
                    if not snp.fenotipo or snp.fenotipo.strip() == "":
                        needs_update = True
                    elif "Variante genética" in snp.fenotipo:
                        needs_update = True
                    elif "Medida antropometric" in snp.fenotipo:
                        needs_update = True
                    elif snp.fenotipo == f"rs{rsid}":
                        needs_update = True
                    
                    if needs_update:
                        with transaction.atomic():
                            # Actualizar fenotipo
                            snp.fenotipo = enrichment_data['fenotipo']
                            
                            # Actualizar categoría si está disponible
                            if 'categoria' in enrichment_data:
                                snp.categoria = enrichment_data['categoria']
                            
                            # Actualizar nivel de riesgo
                            if 'nivel_riesgo' in enrichment_data:
                                snp.nivel_riesgo = enrichment_data['nivel_riesgo']
                            
                            # Actualizar magnitud del efecto
                            if 'magnitud_efecto' in enrichment_data:
                                snp.magnitud_efecto = enrichment_data['magnitud_efecto']
                            
                            # Actualizar fuente de base de datos
                            if 'fuente_base_datos' in enrichment_data:
                                snp.fuente_base_datos = enrichment_data['fuente_base_datos']
                            
                            # Actualizar tipo de evidencia
                            if 'tipo_evidencia' in enrichment_data:
                                snp.tipo_evidencia = enrichment_data['tipo_evidencia']
                            
                            # Actualizar cromosoma si está vacío (validar longitud máxima 5 caracteres)
                            if 'cromosoma' in enrichment_data and (not snp.cromosoma or snp.cromosoma.strip() == ""):
                                chr_value = str(enrichment_data['cromosoma'])[:5]
                                snp.cromosoma = chr_value
                            
                            # Actualizar alelos si están vacíos (validar longitud máxima 50 caracteres)
                            if 'alelo_ref' in enrichment_data and (not snp.alelo_referencia or snp.alelo_referencia.strip() == ""):
                                snp.alelo_referencia = str(enrichment_data['alelo_ref'])[:50]
                            
                            if 'alelo_alt' in enrichment_data and (not snp.alelo_alternativo or snp.alelo_alternativo.strip() == ""):
                                snp.alelo_alternativo = str(enrichment_data['alelo_alt'])[:50]
                            
                            # Actualizar fecha de actualización (formato YYYY-MM-DD con max 10 caracteres)
                            snp.fecha_actualizacion = datetime.now().strftime('%Y-%m-%d')
                            
                            snp.save()
                            
                            updated_count += 1
                            self.stdout.write(
                                self.style.SUCCESS(
                                    f"✅ {rsid} (ID: {snp.id}) - Actualizado"
                                )
                            )
                            self.stdout.write(
                                f"   Anterior: {old_phenotype}"
                            )
                            self.stdout.write(
                                f"   Nuevo: {snp.fenotipo}"
                            )
                            self.stdout.write(
                                f"   Categoría: {snp.categoria} | Riesgo: {snp.nivel_riesgo} | Magnitud: {snp.magnitud_efecto}"
                            )
                            self.stdout.write("")
                    
            except Exception as e:
                error_msg = f"❌ Error procesando {rsid}: {str(e)}"
                errors.append(error_msg)
                self.stdout.write(self.style.ERROR(error_msg))
        
        # SEGUNDO PASO: Buscar otros registros problemáticos que no estén en el diccionario
        self.stdout.write(self.style.WARNING("\n" + "=" * 80))
        self.stdout.write(self.style.WARNING("VERIFICANDO REGISTROS RESTANTES"))
        self.stdout.write(self.style.WARNING("=" * 80))
        
        # Buscar registros con "Medida antropométrica" que no fueron actualizados
        medida_snps = SNP.objects.filter(fenotipo__icontains="Medida antropometric")
        if medida_snps.exists():
            self.stdout.write(self.style.WARNING(f"\n⚠️  {medida_snps.count()} registros con 'Medida antropométrica' sin actualizar:"))
            for snp in medida_snps[:20]:  # Mostrar primeros 20
                self.stdout.write(f"   - {snp.rsid} (ID: {snp.id}): {snp.fenotipo}")
        
        # Buscar registros genéricos
        generic_snps = SNP.objects.filter(fenotipo__startswith="Variante genética rs")
        if generic_snps.exists():
            self.stdout.write(self.style.WARNING(f"\n⚠️  {generic_snps.count()} registros genéricos sin actualizar:"))
            for snp in generic_snps[:20]:  # Mostrar primeros 20
                self.stdout.write(f"   - {snp.rsid} (ID: {snp.id}): {snp.fenotipo}")
        
        # Buscar registros con fenotipo vacío
        empty_snps = SNP.objects.filter(fenotipo__isnull=True) | SNP.objects.filter(fenotipo="")
        if empty_snps.exists():
            self.stdout.write(self.style.WARNING(f"\n⚠️  {empty_snps.count()} registros con fenotipo vacío:"))
            for snp in empty_snps[:20]:  # Mostrar primeros 20
                self.stdout.write(f"   - {snp.rsid} (ID: {snp.id})")
        
        # Resumen final
        self.stdout.write(self.style.WARNING("\n" + "=" * 80))
        self.stdout.write(self.style.WARNING("RESUMEN FINAL"))
        self.stdout.write(self.style.WARNING("=" * 80))
        self.stdout.write(f"📊 Total SNPs en DB: {total_snps}")
        self.stdout.write(self.style.SUCCESS(f"✅ Registros actualizados: {updated_count}"))
        
        if errors:
            self.stdout.write(self.style.ERROR(f"❌ Errores encontrados: {len(errors)}"))
            for error in errors[:10]:  # Mostrar primeros 10 errores
                self.stdout.write(f"   {error}")
        
        remaining_problematic = medida_snps.count() + generic_snps.count() + empty_snps.count()
        if remaining_problematic > 0:
            self.stdout.write(self.style.WARNING(f"⚠️  Registros problemáticos restantes: {remaining_problematic}"))
        else:
            self.stdout.write(self.style.SUCCESS("🎉 ¡TODOS los registros problemáticos han sido actualizados!"))
        
        self.stdout.write(self.style.WARNING("=" * 80))
