#!/bin/bash

cd "$( cd "$(dirname "$0")" && pwd )/.."

VERSION="0.0.3"
NAME="avatar-generator"
IMAGE="sergeyitsib/$NAME"
PORT="3022"

# Remove old image
docker container stop "$NAME"
docker container rm "$NAME"
docker image rm "$IMAGE"

docker build -f Dockerfile -t "$IMAGE:latest" -t "$IMAGE:$VERSION"  .

docker run --detach --name "$NAME" -p "$PORT:$PORT" -e PORT="$PORT" "$IMAGE"
