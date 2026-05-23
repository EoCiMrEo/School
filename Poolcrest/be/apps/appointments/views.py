"""
Views for Appointments app.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from datetime import datetime, timedelta, date
from .models import Appointment, RecurringAppointment, AppointmentCheckIn
from .serializers import (
    AppointmentListSerializer,
    AppointmentDetailSerializer,
    AppointmentCreateSerializer,
    AppointmentUpdateSerializer,
    AppointmentRescheduleSerializer,
    AppointmentBulkActionSerializer,
    RecurringAppointmentSerializer,
    AppointmentCheckInSerializer,
    AppointmentCalendarSerializer,
    TechnicianScheduleSerializer
)
from apps.users.permissions import IsOwnerOrStaff, IsStaffMember, IsTechnicianOrAbove
from apps.core.enums import AppointmentStatus


class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing appointments.
    Provides CRUD operations and scheduling functionality.
    """
    
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['customer', 'technician', 'property_ref', 'service', 'status', 'priority']
    search_fields = ['confirmation_code', 'property__address_line1', 'customer__full_name']
    ordering_fields = ['scheduled_date', 'created_at', 'priority', 'status']
    ordering = ['scheduled_date']
    
    def get_queryset(self):
        """Get appointments based on user role"""
        queryset = Appointment.objects.filter(is_deleted=False)
        user = self.request.user
        
        # Customers can only see their own appointments
        if hasattr(user, 'profile') and user.profile.is_customer:
            queryset = queryset.filter(customer=user.profile)
        
        # Technicians can see their assigned appointments
        elif hasattr(user, 'profile') and user.profile.is_technician:
            queryset = queryset.filter(
                Q(technician=user.profile) |
                Q(technician__isnull=True)  # Also see unassigned appointments
            )
        
        # Filter by date range if provided
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(scheduled_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(scheduled_date__lte=end_date)
        
        # Prefetch related data
        queryset = queryset.select_related(
            'customer', 'technician', 'property_ref', 'service'
        ).prefetch_related('additional_services', 'check_ins')
        
        return queryset
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'list':
            return AppointmentListSerializer
        elif self.action == 'create':
            return AppointmentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return AppointmentUpdateSerializer
        elif self.action == 'retrieve':
            return AppointmentDetailSerializer
        return AppointmentListSerializer
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsStaffMember]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        """Set created_by when creating appointment"""
        serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        """Set updated_by when updating appointment"""
        serializer.save(updated_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's appointments"""
        today = timezone.now().date()
        appointments = self.get_queryset().filter(
            scheduled_date__date=today
        )
        serializer = AppointmentListSerializer(
            appointments,
            many=True,
            context={'request': request}
        )
        return Response({
            'date': today,
            'appointments': serializer.data,
            'total': appointments.count()
        })
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming appointments"""
        now = timezone.now()
        appointments = self.get_queryset().filter(
            scheduled_date__gt=now,
            status__in=[AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]
        ).order_by('scheduled_date')[:20]
        
        serializer = AppointmentListSerializer(
            appointments,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def past_due(self, request):
        """Get past due appointments"""
        now = timezone.now()
        appointments = self.get_queryset().filter(
            scheduled_date__lt=now,
            status__in=[AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]
        )
        serializer = AppointmentListSerializer(
            appointments,
            many=True,
            context={'request': request}
        )
        return Response({
            'appointments': serializer.data,
            'total': appointments.count()
        })
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm an appointment"""
        appointment = self.get_object()
        
        if appointment.status == AppointmentStatus.CONFIRMED:
            return Response(
                {'error': _('Appointment is already confirmed')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.confirm(user=request.user)
        serializer = AppointmentDetailSerializer(appointment, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an appointment"""
        appointment = self.get_object()
        
        if appointment.status == AppointmentStatus.CANCELLED:
            return Response(
                {'error': _('Appointment is already cancelled')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reason = request.data.get('reason', '')
        appointment.cancel(user=request.user, reason=reason)
        serializer = AppointmentDetailSerializer(appointment, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reschedule(self, request, pk=None):
        """Reschedule an appointment"""
        appointment = self.get_object()
        serializer = AppointmentRescheduleSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        new_date = serializer.validated_data['new_date']
        new_appointment = appointment.reschedule(new_date, user=request.user)
        
        response_serializer = AppointmentDetailSerializer(
            new_appointment,
            context={'request': request}
        )
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def start_service(self, request, pk=None):
        """Start service for an appointment"""
        appointment = self.get_object()
        
        # Check if user is the assigned technician
        if not hasattr(request.user, 'profile') or appointment.technician != request.user.profile:
            return Response(
                {'error': _('Only the assigned technician can start service')},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if appointment.status != AppointmentStatus.CONFIRMED:
            return Response(
                {'error': _('Appointment must be confirmed before starting service')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.start_service()
        serializer = AppointmentDetailSerializer(appointment, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete_service(self, request, pk=None):
        """Complete service for an appointment"""
        appointment = self.get_object()
        
        # Check if user is the assigned technician
        if not hasattr(request.user, 'profile') or appointment.technician != request.user.profile:
            return Response(
                {'error': _('Only the assigned technician can complete service')},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if appointment.status != AppointmentStatus.IN_PROGRESS:
            return Response(
                {'error': _('Service must be in progress to complete')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        notes = request.data.get('completion_notes', '')
        appointment.complete_service(notes=notes)
        
        # Update with additional data if provided
        if 'issues_found' in request.data:
            appointment.issues_found = request.data['issues_found']
        if 'recommendations' in request.data:
            appointment.recommendations = request.data['recommendations']
        if 'after_photos' in request.data:
            appointment.after_photos = request.data['after_photos']
        appointment.save()
        
        serializer = AppointmentDetailSerializer(appointment, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def check_in(self, request, pk=None):
        """Check in to an appointment"""
        appointment = self.get_object()
        
        # Check if user is a technician
        if not hasattr(request.user, 'profile') or not request.user.profile.is_technician:
            return Response(
                {'error': _('Only technicians can check in')},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Create check-in record
        location = request.data.get('location', {})
        check_in = AppointmentCheckIn.objects.create(
            appointment=appointment,
            technician=request.user.profile,
            check_in_location=location,
            created_by=request.user
        )
        
        serializer = AppointmentCheckInSerializer(check_in, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def check_out(self, request, pk=None):
        """Check out from an appointment"""
        appointment = self.get_object()
        
        # Get the latest check-in for this technician
        check_in = AppointmentCheckIn.objects.filter(
            appointment=appointment,
            technician=request.user.profile,
            check_out_time__isnull=True
        ).first()
        
        if not check_in:
            return Response(
                {'error': _('No active check-in found')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        location = request.data.get('location', {})
        mileage = request.data.get('mileage')
        check_in.check_out(location=location, mileage=mileage)
        
        serializer = AppointmentCheckInSerializer(check_in, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_action(self, request):
        """Perform bulk actions on appointments"""
        serializer = AppointmentBulkActionSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        appointment_ids = data['appointment_ids']
        action = data['action']
        
        appointments = Appointment.objects.filter(
            id__in=appointment_ids,
            is_deleted=False
        )
        
        if action == 'confirm':
            for appointment in appointments:
                if appointment.status == AppointmentStatus.PENDING:
                    appointment.confirm(user=request.user)
            message = f"Confirmed {appointments.count()} appointments"
        
        elif action == 'cancel':
            reason = data.get('cancellation_reason', '')
            for appointment in appointments:
                if appointment.status not in [AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED]:
                    appointment.cancel(user=request.user, reason=reason)
            message = f"Cancelled {appointments.count()} appointments"
        
        elif action == 'assign_technician':
            from apps.users.models import UserProfile
            technician = UserProfile.objects.get(id=data['technician_id'])
            appointments.update(technician=technician, updated_by=request.user)
            message = f"Assigned {appointments.count()} appointments to {technician.full_name}"
        
        elif action == 'send_reminders':
            count = 0
            for appointment in appointments:
                if not appointment.reminder_sent:
                    appointment.send_reminder()
                    count += 1
            message = f"Sent reminders for {count} appointments"
        
        return Response({'message': message}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def calendar(self, request):
        """Get calendar view of appointments"""
        # Get date range
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not start_date:
            start_date = timezone.now().date()
        else:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        
        if not end_date:
            end_date = start_date + timedelta(days=30)
        else:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        # Get appointments in date range
        appointments = self.get_queryset().filter(
            scheduled_date__date__gte=start_date,
            scheduled_date__date__lte=end_date
        )
        
        # Group by date
        calendar_data = []
        current_date = start_date
        
        while current_date <= end_date:
            day_appointments = appointments.filter(scheduled_date__date=current_date)
            
            if day_appointments.exists():
                calendar_data.append({
                    'date': current_date,
                    'appointments': AppointmentListSerializer(
                        day_appointments,
                        many=True,
                        context={'request': request}
                    ).data,
                    'total_appointments': day_appointments.count(),
                    'total_confirmed': day_appointments.filter(
                        status=AppointmentStatus.CONFIRMED
                    ).count(),
                    'total_pending': day_appointments.filter(
                        status=AppointmentStatus.PENDING
                    ).count(),
                    'total_completed': day_appointments.filter(
                        status=AppointmentStatus.COMPLETED
                    ).count(),
                })
            
            current_date += timedelta(days=1)
        
        return Response(calendar_data)
    
    @action(detail=False, methods=['get'])
    def technician_schedule(self, request):
        """Get technician schedule"""
        from apps.users.models import UserProfile
        
        # Get technician
        technician_id = request.query_params.get('technician_id')
        if technician_id:
            try:
                technician = UserProfile.objects.get(id=technician_id, role='technician')
            except UserProfile.DoesNotExist:
                return Response(
                    {'error': _('Technician not found')},
                    status=status.HTTP_404_NOT_FOUND
                )
        elif hasattr(request.user, 'profile') and request.user.profile.is_technician:
            technician = request.user.profile
        else:
            return Response(
                {'error': _('Technician ID required')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get date
        date_str = request.query_params.get('date')
        if date_str:
            schedule_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        else:
            schedule_date = timezone.now().date()
        
        # Get appointments for technician on this date
        appointments = Appointment.objects.filter(
            technician=technician,
            scheduled_date__date=schedule_date,
            is_deleted=False
        ).order_by('scheduled_date')
        
        # Calculate total duration
        total_duration = sum([
            apt.estimated_duration_minutes for apt in appointments
        ])
        
        # Calculate available slots (simplified)
        # In production, this would be more sophisticated
        available_slots = []
        business_start = datetime.combine(schedule_date, datetime.min.time()).replace(hour=8)
        business_end = datetime.combine(schedule_date, datetime.min.time()).replace(hour=18)
        
        # Find gaps in schedule
        last_end = business_start
        for apt in appointments:
            if apt.scheduled_date > last_end:
                available_slots.append({
                    'start': last_end,
                    'end': apt.scheduled_date,
                    'duration_minutes': int((apt.scheduled_date - last_end).total_seconds() / 60)
                })
            last_end = apt.scheduled_end_time or (apt.scheduled_date + timedelta(minutes=apt.estimated_duration_minutes))
        
        if last_end < business_end:
            available_slots.append({
                'start': last_end,
                'end': business_end,
                'duration_minutes': int((business_end - last_end).total_seconds() / 60)
            })
        
        from apps.users.serializers import UserProfileSerializer
        
        return Response({
            'technician': UserProfileSerializer(technician).data,
            'date': schedule_date,
            'appointments': AppointmentListSerializer(
                appointments,
                many=True,
                context={'request': request}
            ).data,
            'total_appointments': appointments.count(),
            'total_duration_minutes': total_duration,
            'available_slots': available_slots
        })
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get appointment statistics"""
        if not request.user.is_staff:
            return Response(
                {'error': _('Only staff can view statistics')},
                status=status.HTTP_403_FORBIDDEN
            )
        
        appointments = self.get_queryset()
        now = timezone.now()
        today = now.date()
        
        stats = {
            'total_appointments': appointments.count(),
            'status_breakdown': {},
            'priority_breakdown': {},
            'today': {
                'total': appointments.filter(scheduled_date__date=today).count(),
                'completed': appointments.filter(
                    scheduled_date__date=today,
                    status=AppointmentStatus.COMPLETED
                ).count(),
                'pending': appointments.filter(
                    scheduled_date__date=today,
                    status=AppointmentStatus.PENDING
                ).count(),
            },
            'this_week': {
                'total': appointments.filter(
                    scheduled_date__week=today.isocalendar()[1]
                ).count(),
            },
            'this_month': {
                'total': appointments.filter(
                    scheduled_date__month=today.month,
                    scheduled_date__year=today.year
                ).count(),
            },
            'average_duration': appointments.filter(
                actual_start_time__isnull=False,
                actual_end_time__isnull=False
            ).aggregate(
                avg_duration=Avg('estimated_duration_minutes')
            )['avg_duration'],
            'revenue': {
                'today': appointments.filter(
                    scheduled_date__date=today,
                    status=AppointmentStatus.COMPLETED
                ).aggregate(total=Sum('total_amount'))['total'] or 0,
                'this_month': appointments.filter(
                    scheduled_date__month=today.month,
                    scheduled_date__year=today.year,
                    status=AppointmentStatus.COMPLETED
                ).aggregate(total=Sum('total_amount'))['total'] or 0,
            }
        }
        
        # Count by status
        for status in AppointmentStatus:
            count = appointments.filter(status=status.value).count()
            if count > 0:
                stats['status_breakdown'][status.label] = count
        
        # Count by priority
        from apps.core.enums import PriorityLevel
        for priority in PriorityLevel:
            count = appointments.filter(priority=priority.value).count()
            if count > 0:
                stats['priority_breakdown'][priority.label] = count
        
        return Response(stats)


class RecurringAppointmentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing recurring appointments"""
    
    queryset = RecurringAppointment.objects.filter(is_deleted=False)
    serializer_class = RecurringAppointmentSerializer
    permission_classes = [IsAuthenticated, IsStaffMember]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['customer', 'property_ref', 'frequency', 'is_active']
    ordering_fields = ['start_date', 'created_at']
    ordering = ['start_date']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def generate(self, request, pk=None):
        """Generate appointments from recurring schedule"""
        recurring = self.get_object()
        
        # Get until date
        until_date = request.data.get('until_date')
        if until_date:
            until_date = datetime.strptime(until_date, '%Y-%m-%d').date()
        
        appointments = recurring.generate_appointments(until_date)
        
        return Response({
            'message': f"Generated {len(appointments)} appointments",
            'appointments': [apt.confirmation_code for apt in appointments]
        })
    
    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        """Pause recurring schedule"""
        recurring = self.get_object()
        recurring.is_active = False
        recurring.save(update_fields=['is_active'])
        return Response({'message': _('Recurring schedule paused')})
    
    @action(detail=True, methods=['post'])
    def resume(self, request, pk=None):
        """Resume recurring schedule"""
        recurring = self.get_object()
        recurring.is_active = True
        recurring.save(update_fields=['is_active'])
        return Response({'message': _('Recurring schedule resumed')})
