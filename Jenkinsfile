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
                BUILD_TRIGGER_BY = sh ( script: "BUILD_BY=\$(curl -k --silent ${BUILD_URL}/api/xml | tr '<' '\n' | egrep '^userId>|^userName>' | sed 's/.*>//g' | sed -e '1s/\$/ \\/ /g'); if [[ -z \${BUILD_BY} ]]; then BUILD_BY=\$(curl -k --silent ${BUILD_URL}/api/xml | tr '<' '\n' | grep '^shortDescription>' | sed 's/.*user //g;s/.*by //g'); fi; echo \${BUILD_BY}", returnStdout: true ).trim()
echo "BUILD_TRIGGER_BY: ${BUILD_TRIGGER_BY}"
                sh '''
terraform init
terraform plan -out \'task.plan\'
terraform apply \'task.plan\'
'''
            }
        }
    }
}
