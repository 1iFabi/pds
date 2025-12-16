from django.db import migrations, models
from autenticacion import models as auth_models


class Migration(migrations.Migration):

    dependencies = [
        ('autenticacion', '0020_create_reception_group'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='phone',
            field=models.CharField(blank=True, max_length=20, validators=[auth_models.validate_chilean_phone]),
        ),
        migrations.AlterField(
            model_name='profile',
            name='rut',
            field=models.CharField(blank=False, help_text='RUT en formato XXXXXXX-R (ejemplo: 12345678-9 o 1234567-K)', max_length=12, null=False, unique=True, validators=[auth_models.validate_rut_format], verbose_name='RUT'),
        ),
        migrations.AlterField(
            model_name='snp',
            name='rsid',
            field=models.CharField(max_length=20, verbose_name='rsID'),
        ),
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.AlterUniqueTogether(
                    name='snp',
                    unique_together=set(),
                ),
            ],
        ),
        migrations.AddIndex(
            model_name='snp',
            index=models.Index(fields=['rsid'], name='snp_rsid_idx'),
        ),
        migrations.AddIndex(
            model_name='snp',
            index=models.Index(fields=['categoria'], name='snp_cat_idx'),
        ),
        migrations.AddIndex(
            model_name='snp',
            index=models.Index(fields=['cromosoma'], name='snp_chr_idx'),
        ),
        migrations.AddIndex(
            model_name='snp',
            index=models.Index(fields=['nivel_riesgo'], name='snp_risk_idx'),
        ),
        migrations.AddIndex(
            model_name='snp',
            index=models.Index(fields=['cromosoma', 'posicion'], name='snp_chr_pos_idx'),
        ),
        migrations.AddIndex(
            model_name='snp',
            index=models.Index(fields=['categoria', 'nivel_riesgo'], name='snp_cat_risk_idx'),
        ),
        migrations.AddConstraint(
            model_name='usersnp',
            constraint=models.UniqueConstraint(fields=('user', 'snp'), name='usersnp_user_snp_unique'),
        ),
    ]
