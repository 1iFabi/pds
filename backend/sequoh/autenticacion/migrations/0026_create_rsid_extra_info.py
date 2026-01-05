from decimal import Decimal
import random

from django.db import migrations, models


DISCLAIMER = "Esto es informativo y no constituye diagn\u00f3stico m\u00e9dico."


def _word_count(text):
    return len(text.split())


def _build_description(phenotype_name):
    base_sentences = [
        f"Esta variante se asocia a {phenotype_name} en estudios poblacionales y ofrece una guia general.",
        "Los resultados pueden variar segun otros genes, estilo de vida y contexto ambiental.",
        "La informacion se presenta para apoyar conversaciones informadas y no reemplaza evaluacion clinica.",
    ]
    optional_sentences = [
        "El efecto observado suele ser modesto y no determina por si solo un resultado.",
        "Considera el historial familiar, habitos y otros factores al interpretar este dato.",
        "Si tienes dudas, consulta con un profesional de salud para un enfoque integral.",
    ]

    selected = list(base_sentences)
    while _word_count(" ".join(selected + [DISCLAIMER])) < 70 and optional_sentences:
        selected.append(optional_sentences.pop(0))

    while _word_count(" ".join(selected + [DISCLAIMER])) > 120 and len(selected) > len(base_sentences):
        selected.pop()

    return " ".join(selected + [DISCLAIMER])


def _random_freq():
    roll = random.random()
    if roll < 0.1:
        value = random.uniform(0, 2)
    elif roll < 0.9:
        value = random.triangular(5, 40, 18)
    else:
        value = random.triangular(40, 70, 55)
    value = max(0.0, min(100.0, value))
    return Decimal(str(round(value, 2)))


def populate_rsid_extra_info(apps, schema_editor):
    SNP = apps.get_model("autenticacion", "SNP")
    RsidExtraInfo = apps.get_model("autenticacion", "RsidExtraInfo")

    qs = SNP.objects.values_list("rsid", "genotipo", "fenotipo").distinct()
    batch = []
    for rsid, genotype, phenotype in qs.iterator():
        rsid = (rsid or "").strip()
        genotype = (genotype or "").strip()
        if not rsid or not genotype:
            continue

        phenotype_name = (phenotype or "").strip()
        if not phenotype_name:
            phenotype_name = "N/D"
            description = "N/D"
        else:
            description = _build_description(phenotype_name)

        batch.append(
            RsidExtraInfo(
                rs_id=rsid,
                genotype=genotype,
                phenotype_name=phenotype_name,
                freq_chile_percent=_random_freq(),
                phenotype_description=description,
            )
        )

        if len(batch) >= 500:
            RsidExtraInfo.objects.bulk_create(batch, ignore_conflicts=True)
            batch = []

    if batch:
        RsidExtraInfo.objects.bulk_create(batch, ignore_conflicts=True)


class Migration(migrations.Migration):
    dependencies = [
        ("autenticacion", "0025_alter_snp_pharmacogenetic_system"),
    ]

    operations = [
        migrations.CreateModel(
            name="RsidExtraInfo",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("rs_id", models.CharField(max_length=20, verbose_name="rsID")),
                ("genotype", models.CharField(max_length=10, verbose_name="Genotype")),
                ("phenotype_name", models.TextField(verbose_name="Phenotype name")),
                ("freq_chile_percent", models.DecimalField(decimal_places=2, max_digits=5, verbose_name="Chile frequency percent")),
                ("phenotype_description", models.TextField(verbose_name="Phenotype description")),
            ],
            options={
                "db_table": "rsid_extra_info",
                "verbose_name": "RSID extra info",
                "verbose_name_plural": "RSID extra info",
                "unique_together": {("rs_id", "genotype", "phenotype_name")},
                "indexes": [
                    models.Index(fields=["rs_id"], name="rsid_extra_rsid_idx"),
                    models.Index(fields=["phenotype_name"], name="rsid_extra_pheno_idx"),
                ],
            },
        ),
        migrations.RunPython(populate_rsid_extra_info, migrations.RunPython.noop),
    ]
