docker build -t poolcrest-be ./be
docker build -t poolcrest-fe ./fe
docker run -d --name poolcrest-be --network poolcrest_poolcrest_network -p 8000:8000 poolcrest-be
docker run -d --name poolcrest-fe --network poolcrest_poolcrest_network -p 4028:4028 poolcrest-fe
docker stop poolcrest-be; docker rm poolcrest-be
docker stop poolcrest-fe; docker rm poolcrest-fe
docker cp d:\Projects\Webapps\Poolcrest\be\.env poolcrest-be:/app/.env
docker cp D:\Projects\Webapps\Poolcrest\be\media\services\13-116-155-scaled_5Tp2zPP.jpg poolcrest-be:/app/media\services\13-116-155-scaled_5Tp2zPP.jpg
docker cp D:\Projects\Webapps\Poolcrest\be\media\services\ poolcrest-be:/app/media\services\