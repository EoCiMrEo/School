from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_userprofile_date_of_birth'),
    ]

    operations = [
        migrations.CreateModel(
            name='EmailVerificationCode',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=6)),
                ('token', models.CharField(max_length=64, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('expires_at', models.DateTimeField()),
                ('used_at', models.DateTimeField(blank=True, null=True)),
                ('attempts', models.PositiveIntegerField(default=0)),
                ('is_used', models.BooleanField(default=False)),
                ('sent_ip', models.GenericIPAddressField(blank=True, null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='email_verifications', to='users.user')),
            ],
            options={
                'db_table': 'email_verification_codes',
            },
        ),
        migrations.AddIndex(
            model_name='emailverificationcode',
            index=models.Index(fields=['user', 'is_used'], name='email_ver_user_id_b00bd7_idx'),
        ),
        migrations.AddIndex(
            model_name='emailverificationcode',
            index=models.Index(fields=['token'], name='email_ver_token_idx'),
        ),
        migrations.AddIndex(
            model_name='emailverificationcode',
            index=models.Index(fields=['created_at'], name='email_ver_created_idx'),
        ),
    ]
