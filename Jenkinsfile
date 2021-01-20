pipeline {
    agent {
    node {
        label 'docker'
       // customWorkspace '/some/other/path'
    }
}
    stages {
        stage('scm') {
            steps {
                git 'https://github.com/wakaleo/game-of-life.git'
            }
        }
        stage('build') {
            steps {
                sh 'mvn clean package'
            }
        }
    }
}
