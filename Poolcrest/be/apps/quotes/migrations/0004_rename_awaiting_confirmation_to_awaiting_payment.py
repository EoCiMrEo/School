from django.db import migrations

OLD = 'awaiting_confirmation'
NEW = 'awaiting_payment'


def forwards(apps, schema_editor):
    Quote = apps.get_model('quotes', 'Quote')
    Quote.objects.filter(status=OLD).update(status=NEW)


def backwards(apps, schema_editor):
    Quote = apps.get_model('quotes', 'Quote')
    Quote.objects.filter(status=NEW).update(status=OLD)


class Migration(migrations.Migration):

    dependencies = [
        ('quotes', '0003_quote_contact_email_quote_contact_first_name_and_more'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
