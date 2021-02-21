provider "aws" {
region = "us-east-2"
access_key = "AKIATJYGIKIX3WFC2DOR"
secret_key = "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"
}


resource "aws_instance" "web" {
  ami           = "ami-03d64741867e7bb94" # us-east-2, redhat-8
  instance_type = "t2.micro"
  key_name      = "sha"
  vpc_security_group_ids = ["${aws_security_group.webSG.id}"]
  tags = {
    Name = "remote-exec-provisioner"
    Created_by = "${userName}"
  }
  
}

resource "null_resource" "copy_execute" {
  
    connection {
    type = "ssh"
    host = aws_instance.web.public_ip
    user = "ec2-user"
    private_key = file("sha.pem")
    }

    provisioner "file" {
    source      = "httpd.yml"
    destination = "/tmp/httpd.yml"
  }

 
  
  
   provisioner "remote-exec" {
    inline = [
      "sudo yum update -y",
      "sudo yum install ansible -y",
      "ansible-playbook  '/tmp/httpd.yml'"


    ]
  } 


 
   
  
  depends_on = [ aws_instance.web ]
  
  }

resource "aws_security_group" "webSG" {
  name        = "webSG"
  description = "Allow ssh  inbound traffic"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8080
    to_port     = 8080  
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    cidr_blocks     = ["0.0.0.0/0"]
    
  }
}
output "instance_public_ip_addr" {
  value = aws_instance.web.public_ip
}
