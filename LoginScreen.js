import React, { Component } from 'react';
import { Text, View ,Button,StyleSheet} from 'react-native';
import * as Google from 'expo-google-app-auth';
import firebase from 'firebase';
import db from '../config'
export default class LoginScreen extends Component {
    signInWithGoogleAsync = async () => {
        try {
            const result = await Google.logInAsync({
                behavior: 'web',
                androidClientId: '1078569110540-gmlitp89btl7rv2h4i4u2tbkdse4l95m.apps.googleusercontent.com',
                iosClientId: '1078569110540-7hkholj9ksjtp295vecobdh41j72vnf9.apps.googleusercontent.com',
                scopes: ['profile', 'email'],
            });

            if (result.type === 'success') {
                this.onSignIn(result);
                this.props.navigation.navigate('DashboardScreen');
                return result.accessToken;
            }
            else {
                return { cancelled: true };
            }
        } catch (e) {
            return { error: true };
        }
    }
    onSignIn = (googleUser) => {
        console.log('Google Auth Response', googleUser);
        // We need to register an Observer on Firebase Auth to make sure auth is initialized.
        var unsubscribe = firebase.auth().onAuthStateChanged((firebaseUser) => {
            unsubscribe();
            // Check if we are already signed-in Firebase with the correct user.
            if (!this.isUserEqual(googleUser, firebaseUser)) {
                // Build Firebase credential with the Google ID token.
                var credential = firebase.auth.GoogleAuthProvider.credential(
                    googleUser.idToken,
                    googleUser.accessToken
                );

                // Sign in with credential from the Google user.
                firebase.auth().signInWithCredential(credential)
                .then(function(result){
                    firebase
                    .database()
                    .ref('/users/'+ result.user.uid)
                    .set({
                        gmail:  result.user.email,
                        profile_picture: result.additionalUserInfo.profile.picture,
                        locale: result.additionalUserInfo.profile.locale,
                        first_name:result.additionalUserInfo.profile.given_name,
                        last_name:result.additionalUserInfo.profile.family_name,
                        current_theme:'dark'
                    })
                    .then(function (snapshot) {});
                })
                
                .catch((error) => {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    // The email of the user's account used.
                    var email = error.email;
                    // The firebase.auth.AuthCredential type that was used.
                    var credential = error.credential;
                    // ...
                });
            } else {
                console.log('User already signed-in Firebase.');
            }
        });
    }
     isUserEqual = (googleUser, firebaseUser) => {
        if (firebaseUser) {
          var providerData = firebaseUser.providerData;
          for (var i = 0; i < providerData.length; i++) {
            if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
                providerData[i].uid === googleUser.getBasicProfile().getId()) {
              // We don't need to reauth the Firebase connection.
              return true;
            }
          }
        }
        return false;
      }
    render() {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor:'black'
                }}>
                <Button
                    title="Sign in with Google"
                    onPress={() => this.signInWithGoogleAsync()}
                    style={{backgroundColor:'black'}}
                    ></Button>
            </View>
        )
    }
}
const styles=StyleSheet.create({
googlestyle:{
 color:'white',
 backgroundColor:'black'
}
})