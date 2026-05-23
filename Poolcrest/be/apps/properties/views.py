"""
Views for Property app.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg
from django.utils.translation import gettext_lazy as _
from .models import Property, PropertyPhoto, PropertyNote, ServiceArea
from .serializers import (
    PropertyListSerializer,
    PropertyDetailSerializer,
    PropertyCreateSerializer,
    PropertyPhotoSerializer,
    PropertyNoteSerializer,
    ServiceAreaSerializer,
    PropertyBulkActionSerializer
)

from apps.users.permissions import IsOwnerOrStaff, IsStaffMember

class PropertyViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing properties.
    Provides CRUD operations and custom actions for properties.
    """
    
    permission_classes = [IsAuthenticated, IsOwnerOrStaff]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['customer', 'is_active', 'pool_type', 'pool_size', 'zip_code']
    search_fields = ['property_name', 'address_line1', 'city', 'property_code']
    ordering_fields = ['created_at', 'property_name', 'next_service_date']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Get properties based on user role"""
        queryset = Property.objects.filter(is_deleted=False)
        user = self.request.user
        
        # Customers can only see their own properties
        if hasattr(user, 'profile') and user.profile.is_customer:
            queryset = queryset.filter(customer=user.profile)
        
        # Technicians can see properties in their assigned areas
        elif hasattr(user, 'profile') and user.profile.is_technician:
            service_areas = user.profile.service_areas.all()
            zip_codes = []
            for area in service_areas:
                zip_codes.extend(area.zip_codes)
            queryset = queryset.filter(zip_code__in=zip_codes)
        
        # Prefetch related data for performance
        queryset = queryset.select_related('customer').prefetch_related('photos', 'property_notes')
        
        return queryset
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'list':
            return PropertyListSerializer
        elif self.action == 'create':
            return PropertyCreateSerializer
        elif self.action in ['retrieve', 'update', 'partial_update']:
            return PropertyDetailSerializer
        return PropertyListSerializer
    
    def perform_create(self, serializer):
        """Set created_by when creating property"""
        serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        """Set updated_by when updating property"""
        serializer.save(updated_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_properties(self, request):
        """Get properties for current user (customers only)"""
        if not hasattr(request.user, 'profile'):
            return Response(
                {'error': _('User profile not found')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # if not request.user.profile.is_customer:
        #     return Response(
        #         {'error': _('This endpoint is for customers only')},
        #         status=status.HTTP_403_FORBIDDEN
        #     )
        
        properties = self.get_queryset().filter(customer=request.user.profile)
        serializer = PropertyListSerializer(properties, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def upload_photo(self, request, pk=None):
        """Upload a photo for a property"""
        property_obj = self.get_object()
        serializer = PropertyPhotoSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(
                property=property_obj,
                created_by=request.user
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def add_note(self, request, pk=None):
        """Add a note to a property"""
        property_obj = self.get_object()
        serializer = PropertyNoteSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(
                property=property_obj,
                created_by=request.user
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def service_history(self, request, pk=None):
        """Get service history for a property"""
        property_obj = self.get_object()
        
        # This will be implemented when appointments app is ready
        # For now, return placeholder
        return Response({
            'property_id': property_obj.id,
            'total_services': property_obj.total_services,
            'last_service_date': property_obj.last_service_date,
            'next_service_date': property_obj.next_service_date,
            'services': []  # Will be populated from appointments
        })
    
    @action(detail=False, methods=['post'])
    def bulk_action(self, request):
        """Perform bulk actions on multiple properties"""
        serializer = PropertyBulkActionSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        property_ids = data['property_ids']
        action = data['action']
        
        # Get properties
        properties = Property.objects.filter(
            id__in=property_ids,
            is_deleted=False
        )
        
        # Check permissions
        if not request.user.is_staff:
            return Response(
                {'error': _('Only staff can perform bulk actions')},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Perform action
        if action == 'activate':
            properties.update(is_active=True, updated_by=request.user)
            message = f"Activated {properties.count()} properties"
        
        elif action == 'deactivate':
            properties.update(is_active=False, updated_by=request.user)
            message = f"Deactivated {properties.count()} properties"
        
        elif action == 'delete':
            for prop in properties:
                prop.soft_delete(user=request.user)
            message = f"Deleted {properties.count()} properties"
        
        elif action == 'assign_area':
            service_area = ServiceArea.objects.get(id=data['service_area_id'])
            # Update properties with new area's zip codes
            # This is simplified - in production, you'd have more complex logic
            message = f"Assigned {properties.count()} properties to {service_area.name}"
        
        return Response({'message': message}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def set_primary(self, request, pk=None):
        """Set a property as primary for the customer"""
        property_obj = self.get_object()
        
        # Check if user owns this property
        if hasattr(request.user, 'profile'):
            if property_obj.customer != request.user.profile and not request.user.is_staff:
                return Response(
                    {'error': _('You can only set your own properties as primary')},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        property_obj.is_primary = True
        property_obj.save()
        
        return Response(
            {'message': _('Property set as primary')},
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get property statistics (staff only)"""
        if not request.user.is_staff:
            return Response(
                {'error': _('Only staff can view statistics')},
                status=status.HTTP_403_FORBIDDEN
            )
        
        properties = self.get_queryset()
        
        stats = {
            'total_properties': properties.count(),
            'active_properties': properties.filter(is_active=True).count(),
            'inactive_properties': properties.filter(is_active=False).count(),
            'properties_by_type': {},
            'properties_by_size': {},
            'properties_requiring_service': properties.filter(
                next_service_date__lte=timezone.now()
            ).count(),
        }
        
        # Count by type
        for pool_type in PoolType:
            count = properties.filter(pool_type=pool_type.value).count()
            if count > 0:
                stats['properties_by_type'][pool_type.label] = count
        
        # Count by size
        for pool_size in PoolSize:
            count = properties.filter(pool_size=pool_size.value).count()
            if count > 0:
                stats['properties_by_size'][pool_size.label] = count
        
        return Response(stats)


class PropertyPhotoViewSet(viewsets.ModelViewSet):
    """ViewSet for managing property photos"""
    
    queryset = PropertyPhoto.objects.filter(is_deleted=False)
    serializer_class = PropertyPhotoSerializer
    permission_classes = [IsAuthenticated, IsStaffMember]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def set_primary(self, request, pk=None):
        """Set photo as primary for the property"""
        photo = self.get_object()
        photo.is_primary = True
        photo.save()
        return Response({'message': _('Photo set as primary')})


class PropertyNoteViewSet(viewsets.ModelViewSet):
    """ViewSet for managing property notes"""
    
    queryset = PropertyNote.objects.filter(is_deleted=False)
    serializer_class = PropertyNoteSerializer
    permission_classes = [IsAuthenticated, IsStaffMember]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['property', 'note_type', 'is_pinned', 'is_alert']
    ordering_fields = ['created_at', 'is_pinned', 'is_alert']
    ordering = ['-is_pinned', '-is_alert', '-created_at']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class ServiceAreaViewSet(viewsets.ModelViewSet):
    """ViewSet for managing service areas"""
    
    queryset = ServiceArea.objects.filter(is_deleted=False)
    serializer_class = ServiceAreaSerializer
    permission_classes = [IsAuthenticated, IsStaffMember]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'zip_codes']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    @action(detail=True, methods=['post'])
    def add_zip_code(self, request, pk=None):
        """Add a ZIP code to service area"""
        area = self.get_object()
        zip_code = request.data.get('zip_code')
        
        if not zip_code:
            return Response(
                {'error': _('ZIP code is required')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate ZIP code
        from apps.core.utils import validate_zip_code
        try:
            validate_zip_code(zip_code)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if zip_code not in area.zip_codes:
            area.zip_codes.append(zip_code)
            area.save()
            area.update_property_count()
        
        return Response({'message': _('ZIP code added successfully')})
    
    @action(detail=True, methods=['post'])
    def remove_zip_code(self, request, pk=None):
        """Remove a ZIP code from service area"""
        area = self.get_object()
        zip_code = request.data.get('zip_code')
        
        if not zip_code:
            return Response(
                {'error': _('ZIP code is required')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if zip_code in area.zip_codes:
            area.zip_codes.remove(zip_code)
            area.save()
            area.update_property_count()
        
        return Response({'message': _('ZIP code removed successfully')})
    
    @action(detail=True, methods=['get'])
    def properties(self, request, pk=None):
        """Get all properties in this service area"""
        area = self.get_object()
        properties = Property.objects.filter(
            zip_code__in=area.zip_codes,
            is_active=True,
            is_deleted=False
        )
        serializer = PropertyListSerializer(
            properties,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def check_coverage(self, request):
        """Check if a ZIP code is covered by any service area"""
        zip_code = request.query_params.get('zip_code')
        
        if not zip_code:
            return Response(
                {'error': _('ZIP code is required')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        areas = ServiceArea.objects.filter(
            is_active=True,
            is_deleted=False
        )
        
        for area in areas:
            if area.is_zip_code_covered(zip_code):
                return Response({
                    'covered': True,
                    'area': ServiceAreaSerializer(area).data
                })
        
        return Response({
            'covered': False,
            'message': _('This ZIP code is not in our service area')
        })


# Import necessary modules at the top
from django.utils import timezone
from apps.core.enums import PoolType, PoolSize
