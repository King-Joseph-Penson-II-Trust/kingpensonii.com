from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, viewsets, permissions, status
from .serializers import UserSerializer, NoteSerializer, BlocklistItemSerializer
from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView  # Add this line
from rest_framework.parsers import JSONParser
from .models import Note, BlocklistItem
import os
import ipaddress
import re


class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)

class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated] #AllowAny

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)


# Create your views here.
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class BlocklistView(APIView):
    permission_classes = [AllowAny]

    def get_blocklist_path(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        blocklist_path = os.path.join(base_dir, 'blocklist.txt')
        return blocklist_path
    
    def reload_blocklist(self):
        blocklist_path = self.get_blocklist_path()
        with open(blocklist_path, 'r') as f:
            blocklist = f.read().splitlines()
        return blocklist

    def get(self, request):
        blocklist = self.reload_blocklist()
        return JsonResponse({'blocklist': blocklist})
    
    def post(self, request):
        # Parse the request data
        data = JSONParser().parse(request)
        serializer = BlocklistItemSerializer(data=data)
        if serializer.is_valid():
            blocklist_path = self.reload_blocklist()
            ip_or_domain = serializer.validated_data['ip_or_domain']
            with open(blocklist_path, 'r+') as file:
                blocklist = file.read().splitlines()
                if ip_or_domain in blocklist:
                    return JsonResponse({'status': 'error', 'message': 'IP or domain already in blocklist'}, status=400)
                else:
                    file.write(f'{ip_or_domain}\n')
                    return JsonResponse({'status': 'success', 'ip_or_domain': ip_or_domain}, status=201)

    def delete(self, request):
        # Parse the request data
        data = JSONParser().parse(request)
        serializer = BlocklistItemSerializer(data=data)
        if serializer.is_valid():
            blocklist_path = self.get_blocklist_path()
            ip_or_domain = serializer.validated_data['ip_or_domain']
            # Read the current blocklist
            with open(blocklist_path, 'r') as file:
                lines = file.read().splitlines()
            # Check if ip_or_domain is in the blocklist
            if ip_or_domain in lines:
                # Remove ip_or_domain
                lines.remove(ip_or_domain)
                # Write the updated blocklist back to the file
                with open(blocklist_path, 'w') as file:
                    for line in lines:
                        file.write(f'{line}\n')
                return JsonResponse({'status': 'success', 'action': 'removed', 'ip_or_domain': ip_or_domain})
            else:
                return JsonResponse({'status': 'error', 'message': 'Item not found in blocklist'}, status=404)
        else:
            return JsonResponse({'status': 'error', 'errors': serializer.errors}, status=400)