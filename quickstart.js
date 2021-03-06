
// Client ID and API key from the Developer Console
var CLIENT_ID = '112357665575-fggketfr61ossljtsasu2063ob6dsnjq.apps.googleusercontent.com';
var API_KEY = 'AIzaSyDrCi09_4kgy8JjvR5T2HlgpNss9VzM28w';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
// Recommended: https://www.googleapis.com/auth/drive.file  
//Per-file access to files created or opened by the app. File authorization is granted on a per-user basis and is revoked when the user deauthorizes the app
var SCOPES = 'https://www.googleapis.com/auth/drive';

var authorizeButton = document.getElementById('authorize-button');
var signoutButton = document.getElementById('signout-button');

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
    listFiles();
    //retrieveAllFilesInFolder('11-d1sMK6Z8AW7FFe0aDAkKL7RM_NeXAG', callback);
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
  var pre = document.getElementById('content');
  var textContent = document.createTextNode(message + '\n');
  pre.appendChild(textContent);
}

/**
 * Print files.
 */
function listFiles() {
  gapi.client.drive.files.list({
    'pageSize': 10,
    'fields': "nextPageToken, files(id, name)"
  }).then(function(response) {
    appendPre('Files:');
    var files = response.result.files;
    if (files && files.length > 0) {
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        appendPre(file.name + ' (' + file.id + ')');
      }
    } else {
      appendPre('No files found.');
    }
  });
}

/**
 * Retrieve a list of files belonging to a folder.
 *
 * @param {String} folderId ID of the folder to retrieve files from.
 * @param {Function} callback Function to call when the request is complete.
 *
 */
function retrieveAllFilesInFolder(folderId, callback) {
  var retrievePageOfChildren = function(request, result) {
    request.execute(function(resp) {
      result = result.concat(resp.items);
      var nextPageToken = resp.nextPageToken;
      if (nextPageToken) {
        request = gapi.client.drive.children.list({
          'folderId' : folderId,
          'pageToken': nextPageToken
        });
        retrievePageOfChildren(request, result);
      } else {
        callback(result);
      }
    });
  }
  var initialRequest = gapi.client.drive.children.list({
      'folderId' : folderId
    });
  retrievePageOfChildren(initialRequest, []);
}

//save text as file
function saveTextAsFile()  {
  var firstName = document.getElementById("firstName").value;
  var lastName = document.getElementById("lastName").value;
  var fullName = firstName + " " + lastName;
  var image = document.getElementById("imageInput").files[0];

  console.log(image);
  var fileData = new Blob([image], 
    {
    "type": "image/* "
    }
    );
  /*
  var fileData = {
    "firstName": firstName,
    "lastName": lastName,
    "fullName": fullName,
    "type": "text/html",
    "fileName": fullName 
  }
  */
  insertFile(fileData, fullName);
 } 

//save image as file 
function saveImageAsFile()  {
  
 }

 //
  /*
  var name_dict = {"firstName": firstName, "lastName": lastName,
          "fullName": fullName};
  var json_name = JSON.stringify(name_dict);
  console.log(json_name);


  var user = gapi.auth2.getAuthInstance().currentUser.get();
  console.log(user);
  var oauthToken = user.getAuthResponse(true).access_token;

  $.ajax({
    url: "https://www.googleapis.com/upload/drive/v3/files?uploadType=media",
    type: "POST",
    data: json_name,
    beforeSend: function(xhr) {
      xhr.setRequestHeader("Authorization", "Bearer " + oauthToken);
      xhr.setRequestHeader("Content-Type", " *slash-star");
      xhr.setRequestHeader("X-Upload-Content-Length", json_name.length);
      xhr.setRequestHeader("title", fullName);
      xhr.setRequestHeader("name", fullName);

    },
    success: function(data)  {
      console.log(data);
    },

    error: function(data) {

      console.log(data);
    }
  })
*/

function insertFile(fileData, fileName, callback) {
  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  var reader = new FileReader();
  reader.readAsBinaryString(fileData);
  reader.onload = function(e) {
    var contentType = fileData.type || 'application/octet-stream';
    //Specify folder location for new file by folder ID
    //Locate folder ID in the URL when you open folder in browser
    //var folderId = "11-d1sMK6Z8AW7FFe0aDAkKL7RM_NeXAG";
    var metadata = {
      'title': fileName,
      'mimeType': contentType,
      //Uncomment in order to specify folder 
      //'parents': [{"id": folderId}]
    };
    console.log(metadata);
    var base64Data = btoa(reader.result);
    var multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + contentType + '\r\n' +
        'Content-Transfer-Encoding: base64\r\n' +
        '\r\n' +
        base64Data +
        close_delim;

    var request = gapi.client.request({
        'path': '/upload/drive/v2/files',
        'method': 'POST',
        'params': {'uploadType': 'multipart'},
        'headers': {
          'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
        },
        'body': multipartRequestBody});
    if (!callback) {
      callback = function(file) {
        console.log(file)
      };
    }
    request.execute(callback);
  }
}


document.getElementById("nameForm").addEventListener("submit", 
  function(event)  {
    event.preventDefault();
    saveTextAsFile();
  });

//function for downloading image that the user selected from their computer 

function printFileContent(title, content)  {
  console.log(title);
  console.log(content);
}

function downloadGDriveFile (file, test) {
   
  console.log(file);
  console.log(file.webContentLink);
  if (false) {
    //var accessToken = gapi.auth.getToken().access_token;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', file.webContentLink);
    //xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.onload = function() {
      var content = xhr.responseText;
      printFileContent(file.title, content);
    };
    
    xhr.onerror = function() {
      alert("Download failure.");
    };
    
    xhr.send();
  }
}

function downloadImage()  {
  /*var request2 = gapi.client.request({
        'path': '/drive/v3/files/1rTToTFbh4_ph5bNQ_x0u-zQHpatsZomX',
        'method': 'GET'});*/
  var request = gapi.client.drive.files.get({'fileId': '1rTToTFbh4_ph5bNQ_x0u-zQHpatsZomX', 'fields':'*'});
  console.log(request);
  //console.log(request2)
  request.execute(downloadGDriveFile);
}



