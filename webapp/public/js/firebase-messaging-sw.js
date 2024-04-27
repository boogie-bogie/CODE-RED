importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBWKGEzLjBA-e4PKfp5F9-SyTGgJ1-rGBw',
  authDomain: 'codered-9bb03.firebaseapp.com',
  projectId: 'codered-9bb03',
  storageBucket: 'codered-9bb03.appspot.com',
  messagingSenderId: '377609042128',
  appId: '1:377609042128:web:985550c7edd8ee16c686d5',
  measurementId: 'G-RS03446VPC',
});

const messaging = firebase.messaging();
