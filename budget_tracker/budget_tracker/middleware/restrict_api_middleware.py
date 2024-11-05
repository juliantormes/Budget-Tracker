# from django.conf import settings
# from django.http import HttpResponseForbidden

# class RestrictAPIAccessMiddleware:
#     """
#     Middleware to restrict access to /api/ and /api-* paths in production
#     unless the request is coming from the allowed frontend domain or includes
#     a specific custom header.
#     """
#     def __init__(self, get_response):
#         self.get_response = get_response

#     def __call__(self, request):
#         # Only restrict access in production (when DEBUG is False)
#         if not settings.DEBUG:
#             # Define restricted paths
#             restricted_paths = ['/api/', '/api-']
#             # Check if the request path starts with any restricted path
#             if any(request.path.startswith(path) for path in restricted_paths):
#                 # Allow requests from the specified frontend domain
#                 allowed_referer = 'https://budget-tracker-production-c5da.up.railway.app'
#                 referer = request.META.get('HTTP_REFERER', '')

#                 # Check if the referer matches the allowed domain
#                 if referer.startswith(allowed_referer):
#                     return self.get_response(request)

#                 # Allow requests with a specific custom header
#                 elif request.headers.get('X-Requested-With') == 'XMLHttpRequest':
#                     return self.get_response(request)

#                 # Block all other requests to restricted paths
#                 return HttpResponseForbidden("Access to API is restricted.")
        
#         # Allow all requests if not restricted
#         return self.get_response(request)
