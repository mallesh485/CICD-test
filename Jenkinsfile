def cause = currentBuild.getBuildCauses('hudson.model.Cause$UserIdCause')
echo "userName: ${cause.userName}"
pipeline {
    agent {
    node {
        label 'master'
         
       // customWorkspace '/some/other/path'
    }
}
    stages {
        stage('scm') {
            steps {
                git credentialsId: 'f16d8d2d-2bce-414c-a386-3905fe16f18a', url: 'https://github.com/mallesh485/CICD-test.git'
            }
        }
        stage('build') {
            agent {
              node {
                label 'terraform'
       // customWorkspace '/some/other/path'
                }  
            }
            steps {
                
                sh '''
terraform init
terraform plan -out \'task.plan\'
terraform apply \'task.plan\'
terraform destroy --auto-approve
'''
            }
        }
    }
}
