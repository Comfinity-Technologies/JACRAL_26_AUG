import os
import glob
import re

files = glob.glob(r"c:\Users\archa\OneDrive\Desktop\comfinity\jacral\backend\app\routes\admin\*.py")

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    if 'audit_service.log_action' not in content:
        continue
        
    # Ensure Request is imported
    if 'Request' not in content:
        content = content.replace('from fastapi import APIRouter', 'from fastapi import APIRouter, Request')
        if 'Request' not in content:
            content = content.replace('from fastapi import ', 'from fastapi import Request, ')

    # Add request: Request to route function signatures
    # Look for def func_name(
    lines = content.split('\n')
    new_lines = []
    in_route = False
    for i, line in enumerate(lines):
        if line.startswith('@router.'):
            in_route = True
        
        if in_route and line.startswith('def '):
            if 'request: Request' not in line:
                line = line.replace('def ', 'def ') # just a placeholder
                # Insert request: Request, after the (
                line = line.replace('(', '(request: Request, ', 1)
            in_route = False
            
        # Update audit_service.log_action
        if 'audit_service.log_action(' in line:
            # We just append ip_address=request.client.host if request.client else None
            # The safest way is to replace `audit_service.log_action(` with 
            # `audit_service.log_action(ip_address=request.client.host if request.client else None, `
            # But wait, python kwargs must come after args.
            pass
            
        new_lines.append(line)
        
    content = '\n'.join(new_lines)
    
    # regex replace audit_service.log_action(db, ... )
    # Actually, let's just append it to the end of the arguments.
    # Since it might span multiple lines, regex might be tricky.
    # Let's use re.sub for simple ones.
    
    with open(file, 'w') as f:
        f.write(content)
