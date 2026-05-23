"""
CORS Test View
Simple endpoint to test CORS configuration
"""
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

@csrf_exempt
@require_http_methods(["GET", "POST", "OPTIONS"])
def cors_test(request):
    """
    Simple endpoint to test CORS configuration
    Access at: /api/test-cors/
    """
    if request.method == "OPTIONS":
        # Handle preflight request
        response = JsonResponse({"status": "preflight_ok"})
        return response
    
    return JsonResponse({
        "status": "success",
        "message": "CORS is working!",
        "method": request.method,
        "headers": {
            "origin": request.META.get('HTTP_ORIGIN', 'not set'),
            "content_type": request.META.get('CONTENT_TYPE', 'not set'),
        },
        "user": str(request.user) if request.user.is_authenticated else "anonymous",
        "timestamp": str(timezone.now()) if 'timezone' in dir() else "N/A"
    })
