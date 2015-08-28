from django.core import validators
from django.db import models
from django.utils.translation import ugettext_lazy as _

class URLTextField(models.TextField):
    default_validators = [validators.URLValidator()]
    description = _("URLText")
