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
                sh '''BUILD_TRIGGER_BY=$(curl -k --silent ${BUILD_URL}/api/xml | tr \'<\' \'\\n\' | egrep \'^userId>|^userName>\' | sed \'s/.*>//g\' | sed -e \'1s/$/ \\//g\' | tr \'\\n\' \' \')
echo "BUILD_TRIGGER_BY: ${BUILD_TRIGGER_BY}"
terraform init
terraform plan -out \'task.plan\'
terraform apply \'task.plan\'
'''
            }
        }
    }
}
