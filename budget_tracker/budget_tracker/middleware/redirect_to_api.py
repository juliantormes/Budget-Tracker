# budget_tracker/middleware/redirect_to_api_middleware.py
from django.conf import settings
from django.shortcuts import redirect
import re

class RedirectToApiMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Only apply in non-production environments
        if settings.DEBUG or getattr(settings, 'ENVIRONMENT', '') == 'docker':
            # Check if URL does not start with /api/
            if not re.match(r"^/api/", request.path):
                return redirect('/api/')
        
        return self.get_response(request)
