"""
URL configuration for milkman project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from django.template import TemplateDoesNotExist, loader
from django.template.response import TemplateResponse


def home(request):
    """
    Serve the built frontend (index.html) if present; otherwise return a simple
    health payload so hitting http://localhost:8000/ doesn't 500 in dev.
    """
    try:
        loader.get_template("index.html")
    except TemplateDoesNotExist:
        return JsonResponse(
            {
                "status": "ok",
                "message": "Backend running. Build/copy the frontend to serve index.html from Django templates.",
                "endpoints": [
                    "/staff/",
                    "/customer/",
                    "/category/",
                    "/product/",
                    "/subscription/",
                    "/admin/",
                ],
            }
        )
    return TemplateResponse(request, "index.html")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('staff/', include('staff.urls')),
    path('customer/', include('customer.urls')),
    path('category/', include('category.urls')),
    path('product/', include('product.urls')),
    path('subscription/', include('subscription.urls')),
    path('', home, name='home'),
]
