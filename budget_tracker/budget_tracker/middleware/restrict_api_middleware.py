from django.conf import settings
from django.http import HttpResponseForbidden

class RestrictAPIAccessMiddleware:
    """
    Middleware to restrict API access in production (when DEBUG is False).
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Only restrict API access if DEBUG is False
        if not settings.DEBUG:
            restricted_paths = ['/api/', '/api-']
            # Check if the request path starts with any restricted path
            if any(request.path.startswith(path) for path in restricted_paths):
                return HttpResponseForbidden("Access to API is restricted.")
        return self.get_response(request)
