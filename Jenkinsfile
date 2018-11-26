pipeline {
  agent any
  stages {
    stage('Version & Setup') {
      steps {
        sh '''whoami

              npm --version

              node --version

              npm i
           '''
      }
    }
    stage('Contract Deployment') {
      when {
        branch 'develop'
      }
      environment {
          mnemonic = credentials('mnemonic')
          infura = credentials('infura')
      }
      steps {
        sh '''
            admin=0x15C304cd2A7F970B9318191eFf6c3D6ef6AE2d40
            t2t=0x04706e18178aa9f65f11463789c82bcde8351a7f
            sed -e "s;%admin%;$admin;g" -e "s;%t2t%;$t2t;g" settings.json.default > settings.json
            sed -e "s;%mnemonic%;$mnemonic;g" -e "s;%infura%;$infura;g" truffle.js.default > truffle.js
            truffle migrate --network ropsten --reset > migrate.out
           '''
      }
    }
    stage('Generate the Environment') {
      when {
        branch 'develop'
      }
      steps {
        sh 'node extract_contract.js  < migrate.out > contract.environment.version_${BUILD_NUMBER}.json'
      }
    }
    stage('Save contracts to S3') {
      when {
        branch 'develop'
      }
      steps {
        withAWS(credentials: 'c7266e46-c756-4278-91a9-0055c7341c04', region: 'ap-southeast-1') {
          awsIdentity()
          s3Upload(bucket: 'contracts.traceto.io', pathStyleAccessEnabled: true, acl: 'PublicRead', cacheControl: 'no-cache', file: "contract.environment.version_${BUILD_NUMBER}.json", path: "dev/Contract.environment.version_${BUILD_NUMBER}.json")
          s3Upload(bucket: 'contracts.traceto.io', pathStyleAccessEnabled: true, acl: 'PublicRead', cacheControl: 'no-cache', file: "contract.environment.version_${BUILD_NUMBER}.json", path: 'dev/Contract.environment.version_latest.json')
        }
      }
    }

    stage('Setup Test Data') {
      when {
        branch 'develop'
      }
      environment {
          admin = credentials('PriKey-admin')
          rq    = credentials('PriKey-rq')
          sp    = credentials('PriKey-sp')
          rmisp = credentials('PriKey-rmisp')
          v     = credentials('PriKey-v')
      }
      steps {
        sh '''
            cd setup
            npm i
            sed -e "s;%admin%;$admin;g" -e "s;%rq%;$rq;g" -e "s;%sp%;$sp;g" -e "s;%rmisp%;$rmisp;g" -e "s;%v%;$v;g" index.js.default > index.js
            node index.js ../Details.environment.version_${BUILD_NUMBER}.json
            cd ..
           '''
      }
    }
    stage('Save details to S3') {
      when {
        branch 'develop'
      }
      steps {
        withAWS(credentials: 'c7266e46-c756-4278-91a9-0055c7341c04', region: 'ap-southeast-1') {
          awsIdentity()
          s3Upload(bucket: 'contracts.traceto.io', pathStyleAccessEnabled: true, acl: 'PublicRead', cacheControl: 'no-cache', file: "Details.environment.version_${BUILD_NUMBER}.json", path: "dev/Details.environment.version_${BUILD_NUMBER}.json")
          s3Upload(bucket: 'contracts.traceto.io', pathStyleAccessEnabled: true, acl: 'PublicRead', cacheControl: 'no-cache', file: "Details.environment.version_${BUILD_NUMBER}.json", path: 'dev/Details.environment.version_latest.json')
        }
      }
    }

    stage('complete') {
      when {
        branch 'develop'
      }
      steps {
        slackSend(teamDomain: 'tracetoio.slack.com', color: 'black', channel: 'core_devs', message: 'Contract Deployed')
      }
    }
  }
}