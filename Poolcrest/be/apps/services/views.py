"""
RESTful API views for service management.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg
from django.db import models

from .models import Service
from .serializers import (
    ServiceSerializer, ServiceListSerializer, ServiceCategorySerializer
)
from apps.users.permissions import IsAdminOrManager, IsAdminOnly
from config.logging import get_logger

logger = get_logger('services.views')


class ServiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Service model.
    Provides complete CRUD operations with role-based permissions.
    
    Endpoints:
    - GET /api/services/ - List all active services (public)
    - GET /api/services/{id}/ - Get service details (public)
    - POST /api/services/ - Create service (admin/manager)
    - PUT /api/services/{id}/ - Update service (admin/manager)
    - PATCH /api/services/{id}/ - Partial update (admin/manager)
    - DELETE /api/services/{id}/ - Delete service (admin only)
    """
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status', 'seasonal_availability', 'response_level']
    search_fields = ['name', 'description', 'category']
    ordering_fields = ['name', 'base_price', 'created_at', 'rating', 'review_count']
    ordering = ['name']
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        elif self.action in ['create', 'update', 'partial_update']:
            permission_classes = [IsAdminOrManager]
        elif self.action == 'destroy':
            permission_classes = [IsAdminOnly]
        else:
            permission_classes = [IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filter queryset based on user role and request params."""
        queryset = Service.objects.all()
        
        # Public users only see active services
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(status=True)
        
        # Filter by price range if provided
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        
        if min_price:
            queryset = queryset.filter(base_price__gte=min_price)
        if max_price:
            queryset = queryset.filter(base_price__lte=max_price)
        
        # Backward compatibility: support 'urgency' query param
        urgency = self.request.query_params.get('urgency')
        if urgency:
            queryset = queryset.filter(response_level=urgency)

        return queryset
    
    def get_serializer_class(self):
        """Use lightweight serializer for list action."""
        if self.action == 'list':
            detailed = self.request.query_params.get('detailed') if hasattr(self, 'request') else None
            if detailed in ['1', 'true', 'True', 'yes']:
                return ServiceSerializer
            return ServiceListSerializer
        return ServiceSerializer
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """
        GET /api/services/categories/
        Get all service categories with counts.
        """
        categories = Service.objects.values('category').annotate(
            count=Count('id')
        ).order_by('category')
        
        # Get services for each category
        result = []
        for cat in categories:
            services = Service.objects.filter(
                category=cat['category'], 
                status=True
            )
            result.append({
                'category': cat['category'],
                'count': cat['count'],
                'services': ServiceListSerializer(services, many=True).data
            })
        
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """
        GET /api/services/popular/
        Get most popular services (could be based on quotes/bookings).
        """
        # For now, return services marked as popular or cheapest
        services = Service.objects.filter(
            status=True
        ).order_by('base_price')[:6]
        
        serializer = self.get_serializer(services, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def seasonal(self, request):
        """
        GET /api/services/seasonal/
        Get services available for current season.
        """
        from datetime import datetime
        
        # Determine current season
        month = datetime.now().month
        if month in [12, 1, 2]:
            season = 'winter'
        elif month in [3, 4, 5]:
            season = 'spring'
        elif month in [6, 7, 8]:
            season = 'summer'
        else:
            season = 'fall'
        
        services = Service.objects.filter(
            Q(seasonal_availability=season) |
            Q(seasonal_availability__isnull=True),
            status=True
        )
        
        serializer = self.get_serializer(services, many=True)
        return Response({
            'current_season': season,
            'services': serializer.data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrManager])
    def toggle_status(self, request, pk=None):
        """
        POST /api/services/{id}/toggle_status/
        Toggle service active/inactive status.
        """
        service = self.get_object()
        service.status = not service.status
        service.save()
        
        logger.info(
            f"Service '{service.name}' status toggled to {service.status} "
            f"by {request.user.email}"
        )
        
        return Response({
            'message': f"Service '{service.name}' is now {'active' if service.status else 'inactive'}",
            'status': service.status
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrManager])
    def duplicate(self, request, pk=None):
        """
        POST /api/services/{id}/duplicate/
        Create a copy of the service.
        """
        service = self.get_object()
        
        # Create duplicate
        duplicate = Service.objects.create(
            name=f"{service.name} (Copy)",
            description=service.description,
            category=service.category,
            base_price=service.base_price,
            price_unit=service.price_unit,
            duration_minutes=service.duration_minutes,
            status=False,  # Start as inactive
            seasonal_availability=service.seasonal_availability,
            response_level=service.response_level,
            rating=service.rating,
            review_count=service.review_count,
            features=service.features,
            is_popular=False,
            available_24_7=service.available_24_7
        )
        
        logger.info(
            f"Service '{service.name}' duplicated as '{duplicate.name}' "
            f"by {request.user.email}"
        )
        
        serializer = self.get_serializer(duplicate)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        GET /api/services/statistics/
        Get service statistics (admin/manager only).
        """
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not hasattr(request.user, 'profile'):
            return Response(
                {'error': 'User profile not found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not request.user.profile.can_manage_users:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        stats = {
            'total_services': Service.objects.count(),
            'active_services': Service.objects.filter(status=True).count(),
            'inactive_services': Service.objects.filter(status=False).count(),
            'categories': Service.objects.values('category').distinct().count(),
            'average_price': Service.objects.filter(
                status=True
            ).aggregate(
                avg_price=Avg('base_price')
            )['avg_price'],
            'average_duration': Service.objects.filter(
                status=True
            ).aggregate(
                avg_duration=Avg('duration_minutes')
            )['avg_duration'],
            'by_category': list(Service.objects.values('category').annotate(
                count=Count('id'),
                avg_price=Avg('base_price')
            )),
            'seasonal_services': Service.objects.exclude(
                seasonal_availability__isnull=True
            ).exclude(
                seasonal_availability=''
            ).count()
        }
        
        return Response(stats)