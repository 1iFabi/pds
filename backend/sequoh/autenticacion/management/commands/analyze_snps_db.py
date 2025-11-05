from django.core.management.base import BaseCommand
from autenticacion.models import SNP
from django.db.models import Count


class Command(BaseCommand):
    help = "Analiza exhaustivamente la tabla SNPs"

    def handle(self, *args, **options):
        self.stdout.write("=" * 100)
        self.stdout.write("ANÁLISIS EXHAUSTIVO DE LA TABLA SNPs")
        self.stdout.write("=" * 100)

        # 1. Estadísticas generales
        total_snps = SNP.objects.count()
        self.stdout.write(f"\n📊 ESTADÍSTICAS GENERALES")
        self.stdout.write(f"├─ Total de SNPs: {total_snps}")

        # 2. Análisis de campos vacíos
        self.stdout.write(f"\n📋 ANÁLISIS DE CAMPOS VACÍOS/NULL")
        empty_rsid = SNP.objects.filter(rsid__isnull=True).count()
        empty_genotipo = SNP.objects.filter(genotipo__isnull=True).count()
        empty_fenotipo = SNP.objects.filter(fenotipo__isnull=True).count() + SNP.objects.filter(fenotipo='').count()
        empty_categoria = SNP.objects.filter(categoria__isnull=True).count() + SNP.objects.filter(categoria='').count()
        empty_cromosoma = SNP.objects.filter(cromosoma__isnull=True).count() + SNP.objects.filter(cromosoma='').count()
        empty_posicion = SNP.objects.filter(posicion__isnull=True).count()
        empty_alelo_ref = SNP.objects.filter(alelo_referencia__isnull=True).count() + SNP.objects.filter(alelo_referencia='').count()
        empty_alelo_alt = SNP.objects.filter(alelo_alternativo__isnull=True).count() + SNP.objects.filter(alelo_alternativo='').count()
        empty_nivel_riesgo = SNP.objects.filter(nivel_riesgo__isnull=True).count() + SNP.objects.filter(nivel_riesgo='').count()
        empty_magnitud = SNP.objects.filter(magnitud_efecto__isnull=True).count()
        empty_fuente = SNP.objects.filter(fuente_base_datos__isnull=True).count() + SNP.objects.filter(fuente_base_datos='').count()
        empty_tipo_evidencia = SNP.objects.filter(tipo_evidencia__isnull=True).count() + SNP.objects.filter(tipo_evidencia='').count()
        empty_fecha = SNP.objects.filter(fecha_actualizacion__isnull=True).count() + SNP.objects.filter(fecha_actualizacion='').count()

        self.stdout.write(f"├─ rsID vacío: {empty_rsid} ({empty_rsid/total_snps*100:.1f}%)")
        self.stdout.write(f"├─ Genotipo vacío: {empty_genotipo} ({empty_genotipo/total_snps*100:.1f}%)")
        self.stdout.write(f"├─ Fenotipo vacío: {empty_fenotipo} ({empty_fenotipo/total_snps*100:.1f}%)")
        self.stdout.write(f"├─ Categoría vacía: {empty_categoria} ({empty_categoria/total_snps*100:.1f}%)")
        self.stdout.write(f"├─ Cromosoma vacío: {empty_cromosoma} ({empty_cromosoma/total_snps*100:.1f}%)")
        self.stdout.write(f"├─ Posición vacía: {empty_posicion} ({empty_posicion/total_snps*100:.1f}%)")
        self.stdout.write(f"├─ Alelo Ref vacío: {empty_alelo_ref} ({empty_alelo_ref/total_snps*100:.1f}%)")
        self.stdout.write(f"├─ Alelo Alt vacío: {empty_alelo_alt} ({empty_alelo_alt/total_snps*100:.1f}%)")
        self.stdout.write(f"├─ Nivel Riesgo vacío: {empty_nivel_riesgo} ({empty_nivel_riesgo/total_snps*100:.1f}%)")
        self.stdout.write(f"├─ Magnitud vacía: {empty_magnitud} ({empty_magnitud/total_snps*100:.1f}%)")
        self.stdout.write(f"├─ Fuente vacía: {empty_fuente} ({empty_fuente/total_snps*100:.1f}%)")
        self.stdout.write(f"├─ Tipo Evidencia vacío: {empty_tipo_evidencia} ({empty_tipo_evidencia/total_snps*100:.1f}%)")
        self.stdout.write(f"└─ Fecha vacía: {empty_fecha} ({empty_fecha/total_snps*100:.1f}%)")

        # 3. Análisis de fenotipos genéricos
        self.stdout.write(f"\n🔍 ANÁLISIS DE FENOTIPOS GENÉRICOS")
        generic_patterns = [
            "variante genética",
            "polimorfismo",
            "medida antropométrica",
            "unknown",
            "n/a",
            "snp",
        ]

        for pattern in generic_patterns:
            count = SNP.objects.filter(fenotipo__icontains=pattern).count()
            if count > 0:
                self.stdout.write(f"├─ '{pattern}': {count} ({count/total_snps*100:.1f}%)")

        # 4. Categorías únicas
        self.stdout.write(f"\n📂 CATEGORÍAS ÚNICAS")
        categorias = SNP.objects.values('categoria').distinct().order_by('categoria')
        for cat in categorias:
            cat_name = cat['categoria'] if cat['categoria'] else '(vacío)'
            count = SNP.objects.filter(categoria=cat['categoria']).count()
            self.stdout.write(f"├─ {cat_name}: {count}")

        # 5. Niveles de riesgo
        self.stdout.write(f"\n⚠️ NIVELES DE RIESGO")
        niveles = SNP.objects.values('nivel_riesgo').distinct().order_by('nivel_riesgo')
        for nivel in niveles:
            nivel_name = nivel['nivel_riesgo'] if nivel['nivel_riesgo'] else '(vacío)'
            count = SNP.objects.filter(nivel_riesgo=nivel['nivel_riesgo']).count()
            self.stdout.write(f"├─ {nivel_name}: {count}")

        # 6. Fuentes de datos
        self.stdout.write(f"\n🔗 FUENTES DE DATOS")
        fuentes = SNP.objects.values('fuente_base_datos').distinct().order_by('fuente_base_datos')
        for fuente in fuentes:
            fuente_name = fuente['fuente_base_datos'] if fuente['fuente_base_datos'] else '(vacío)'
            count = SNP.objects.filter(fuente_base_datos=fuente['fuente_base_datos']).count()
            self.stdout.write(f"├─ {fuente_name}: {count}")

        # 7. Tipos de evidencia
        self.stdout.write(f"\n📊 TIPOS DE EVIDENCIA")
        evidencias = SNP.objects.values('tipo_evidencia').distinct().order_by('tipo_evidencia')
        for evidencia in evidencias:
            evid_name = evidencia['tipo_evidencia'] if evidencia['tipo_evidencia'] else '(vacío)'
            count = SNP.objects.filter(tipo_evidencia=evidencia['tipo_evidencia']).count()
            self.stdout.write(f"├─ {evid_name}: {count}")

        # 8. Cromosomas
        self.stdout.write(f"\n🧬 CROMOSOMAS")
        cromosomas = SNP.objects.values('cromosoma').distinct().order_by('cromosoma')
        for cromo in cromosomas:
            cromo_name = cromo['cromosoma'] if cromo['cromosoma'] else '(vacío)'
            count = SNP.objects.filter(cromosoma=cromo['cromosoma']).count()
            self.stdout.write(f"├─ {cromo_name}: {count}")

        # 9. Genotipos
        self.stdout.write(f"\n🧪 GENOTIPOS ÚNICOS (Top 20)")
        genotipos = SNP.objects.values('genotipo').distinct().order_by('genotipo')
        genotipo_list = []
        for geno in genotipos:
            geno_name = geno['genotipo'] if geno['genotipo'] else '(vacío)'
            count = SNP.objects.filter(genotipo=geno['genotipo']).count()
            genotipo_list.append((geno_name, count))

        for geno_name, count in sorted(genotipo_list, key=lambda x: x[1], reverse=True)[:20]:
            self.stdout.write(f"├─ {geno_name}: {count}")

        if len(genotipo_list) > 20:
            self.stdout.write(f"└─ ... y {len(genotipo_list) - 20} más")

        # 10. RSIDs duplicados
        self.stdout.write(f"\n⚙️ ANÁLISIS DE DUPLICADOS")
        duplicate_rsids = SNP.objects.values('rsid', 'genotipo').annotate(count=Count('id')).filter(count__gt=1)
        dup_count = duplicate_rsids.count()
        self.stdout.write(f"├─ Pares rsID-genotipo duplicados: {dup_count}")
        if dup_count > 0:
            for dup in duplicate_rsids[:10]:
                self.stdout.write(f"│  ├─ {dup['rsid']} ({dup['genotipo']}): {dup['count']} registros")
            if dup_count > 10:
                self.stdout.write(f"│  └─ ... y {dup_count - 10} más")

        # 11. Magnitud de efecto
        self.stdout.write(f"\n📈 MAGNITUD DE EFECTO")
        magnitudes = SNP.objects.filter(magnitud_efecto__isnull=False).values_list('magnitud_efecto', flat=True)
        if magnitudes:
            magnitudes_list = list(magnitudes)
            magnitudes_list.sort()
            self.stdout.write(f"├─ Total con magnitud: {len(magnitudes_list)}")
            self.stdout.write(f"├─ Mínimo: {min(magnitudes_list):.4f}")
            self.stdout.write(f"├─ Máximo: {max(magnitudes_list):.4f}")
            self.stdout.write(f"├─ Promedio: {sum(magnitudes_list)/len(magnitudes_list):.4f}")
            self.stdout.write(f"├─ Mediana: {magnitudes_list[len(magnitudes_list)//2]:.4f}")
        else:
            self.stdout.write(f"└─ Sin datos de magnitud")

        # 12. Ejemplos de registros problemáticos
        self.stdout.write(f"\n⚠️ REGISTROS PROBLEMÁTICOS")
        self.stdout.write(f"\n1. Fenotipos vacíos/genéricos (primeros 10):")
        problematic = SNP.objects.filter(fenotipo__isnull=True) | SNP.objects.filter(fenotipo='') | \
                      SNP.objects.filter(fenotipo__icontains='variante genética') | \
                      SNP.objects.filter(fenotipo__icontains='medida antropométrica')
        for snp in problematic[:10]:
            self.stdout.write(f"   ├─ rsID: {snp.rsid}, Genotipo: {snp.genotipo}, Fenotipo: '{snp.fenotipo}'")

        self.stdout.write(f"\n2. Sin categoría (primeros 10):")
        no_cat = SNP.objects.filter(categoria__isnull=True) | SNP.objects.filter(categoria='')
        for snp in no_cat[:10]:
            self.stdout.write(f"   ├─ rsID: {snp.rsid}, Genotipo: {snp.genotipo}, Categoría: '{snp.categoria}'")

        self.stdout.write(f"\n3. Sin nivel de riesgo (primeros 10):")
        no_risk = SNP.objects.filter(nivel_riesgo__isnull=True) | SNP.objects.filter(nivel_riesgo='')
        for snp in no_risk[:10]:
            self.stdout.write(f"   ├─ rsID: {snp.rsid}, Genotipo: {snp.genotipo}, Riesgo: '{snp.nivel_riesgo}'")

        self.stdout.write(f"\n4. Sin magnitud de efecto (primeros 10):")
        no_mag = SNP.objects.filter(magnitud_efecto__isnull=True)
        for snp in no_mag[:10]:
            self.stdout.write(f"   ├─ rsID: {snp.rsid}, Genotipo: {snp.genotipo}, Magnitud: {snp.magnitud_efecto}")

        # 13. Integridad de datos
        self.stdout.write(f"\n✅ INTEGRIDAD DE DATOS")
        complete_records = SNP.objects.exclude(rsid__isnull=True).exclude(fenotipo__isnull=True).exclude(fenotipo='').exclude(categoria__isnull=True).exclude(categoria='').exclude(nivel_riesgo__isnull=True).exclude(nivel_riesgo='')
        self.stdout.write(f"├─ Registros completos (todos los campos principales): {complete_records.count()} ({complete_records.count()/total_snps*100:.1f}%)")
        self.stdout.write(f"└─ Registros incompletos: {total_snps - complete_records.count()} ({(total_snps - complete_records.count())/total_snps*100:.1f}%)")

        self.stdout.write(f"\n" + "=" * 100)
        self.stdout.write("FIN DEL ANÁLISIS")
        self.stdout.write("=" * 100)
        
        self.stdout.write(self.style.SUCCESS('\n✓ Análisis completado exitosamente'))
