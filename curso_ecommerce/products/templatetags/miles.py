import re

from django import template
from django.template.defaultfilters import stringfilter

register = template.Library()


@stringfilter
def miles(val):

    return '.'.join(re.findall('((?:\d+\.)?\d{1,3})', val[::-1]))[::-1]