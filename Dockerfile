FROM public.ecr.aws/lambda/python:3.8
COPY ./kitchenLibrary ./kitchenLibrary
COPY requirements.txt ./requirements.txt
RUN pip install -r requirements.txt
CMD ["kitchenLibrary.app.main.handler"]