import os

# Create directory structure
directories = [
    'static',
    'static/css',
    'static/js',
    'templates',
    'downloads'
]

for directory in directories:
    os.makedirs(directory, exist_ok=True) 