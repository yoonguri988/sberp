#!/bin/bash
cd "$(dirname "$0")/../back"
JAR=$(ls build/libs/*.jar | grep -v plain | head -n1)
exec java -jar "$JAR"
