const express = require('express');
const bodyParser = require('body-parser');
const rp = require('request-promise');

require('dotenv').config();
const PORT = process.env.PORT || 80;
const SERVER_ADDRESS = process.env.SERVER_ADDRESS || '13.209.83.224';
const SERVER_URI = `http://${SERVER_ADDRESS}:${PORT}/static/`;
const egenAPI = 'https://0lpqwmpv11.execute-api.ap-northeast-2.amazonaws.com/default/';
const app = express();

app.use('/static', express.static(__dirname + '/public'));
app.use(bodyParser.json());
const server = app.listen(PORT, 
  () => {
    console.log('hospital search server is listening');
});

app.get('/', (req, res) => {
  res.send('this server is for only chatbotskill');
});

//search hospital by keyword&location
app.post('/api/searchHospital', async function (req, res) {
  //get location
  let location = req.body.action.params.location;
  if(location === undefined){
    res.send(makeTextResponse('알수없는 주소가 들어왔어요ㅠㅠ'));
    return;
  }
  location = JSON.parse(location);
  const x = location.lng;
  const y = location.lat;
  
  if(x === undefined || y === undefined){
    res.send(makeTextResponse('잘못된 위도와 경도가 보내졌어요...'));
    return;
  }

  //search with kakao map api
  const department = req.body.action.params.department;
  if(department === undefined){
    res.send(makeTextResponse('진료과목명이 전달되지 않았어요...'));
    return;
  }
  try{
    //search open hospital
    let search_uri = egenAPI + 
      'searchHospital?lon='+x+
      '&lat='+y+
      '&available=1';
    if(department !== '병원'){
      search_uri = search_uri + '&dept=' + encodeURI(department);
    }

    let response = await rp({
      uri: search_uri, 
      method: "GET", 
    });
    response = JSON.parse(response);

    //process response
    if(!response.success){
      res.send(makeTextResponse(`response of egen server is error... `));
      return;
    }
    if(response.result.length === 0){
      res.send(makeTextResponse(`근처에 열려있는 ${department}가 없습니다... `));
      return;
    }
    const document = response.result[0];
    let description = `앙몬드봇이 가장 가까운 ${department}를 찾았습니다.` +  
        `\n\n병원명: ${document.name}` + 
        `\n위치 : ${document.address}` +
        `\n분류 : ${document.category}` +
        `\n전화번호 : ${document.contact}`;

    res.send(makeResponse(
      document.name,
      description,
      SERVER_URI+'search_hospital.jpg',
      document.url_kakaomap
    ));
    return;   
    
  }catch(err){
    res.send(makeTextResponse('egan api 오류'));
  }
})

//search pharmacy by location
app.post('/api/searchPharmacy', async function (req, res) {
  //get location
  let location = req.body.action.params.location;
  if(location === undefined){
    res.send(makeTextResponse('알수없는 주소가 들어왔어요ㅠㅠ'));
    return;
  }
  location = JSON.parse(location);
  const x = location.lng;
  const y = location.lat;
  
  if(x === undefined || y === undefined){
    res.send(makeTextResponse('잘못된 위도와 경도가 보내졌어요...'));
    return;
  }

  try{
    //search open pharmacy
    let search_uri = egenAPI + 
      'searchPharmacy?lon='+x+
      '&lat='+y+
      '&available=1';

    let response = await rp({
      uri: search_uri, 
      method: "GET", 
    });
    response = JSON.parse(response);

    //process response
    if(!response.success){
      res.send(makeTextResponse(`response of egen server is error... `));
      return;
    }
    if(response.result.length === 0){
      res.send(makeTextResponse(`근처에 열려있는 약국이 없습니다... `));
      return;
    }
    const document = response.result[0];
    let description = `앙몬드봇이 가장 가까운 약국을 찾았습니다.` +  
        `\n\n약국명: ${document.name}` + 
        `\n위치 : ${document.address}` +
        `\n전화번호 : ${document.contact}`;

    res.send(makeResponse(
      document.name,
      description,
      SERVER_URI+'search_pharmacy.jpg',
      document.url_kakaomap
    ));
    return;   
    
  }catch(err){
    res.send(makeTextResponse('egan api 오류'));
  }
})

//search emergencyRoom by location
app.post('/api/searchEmergencyRoom', async function (req, res) {
  //get location
  let location = req.body.action.params.location;
  if(location === undefined){
    res.send(makeTextResponse('알수없는 주소가 들어왔어요ㅠㅠ'));
    return;
  }
  location = JSON.parse(location);
  const x = location.lng;
  const y = location.lat;
  
  if(x === undefined || y === undefined){
    res.send(makeTextResponse('잘못된 위도와 경도가 보내졌어요...'));
    return;
  }

  try{
    //search open emergency room
    let search_uri = egenAPI + 
      'searchHospital?lon='+x+
      '&lat='+y+
      '&available=1&emergency=1';

    let response = await rp({
      uri: search_uri, 
      method: "GET", 
    });
    response = JSON.parse(response);

    //process response
    if(!response.success){
      res.send(makeTextResponse(`response of egen server is error... `));
      return;
    }
    if(response.result.length === 0){
      res.send(makeTextResponse(`근처에 열려있는 응급실이 없습니다... `));
      return;
    }
    const document = response.result[0];
    let description = `앙몬드봇이 가장 가까운 응급실을 찾았습니다.` +  
        `\n\n병원명: ${document.name}` + 
        `\n위치 : ${document.address}` +
        `\n분류 : ${document.category}` +
        `\n전화번호 : ${document.contact}`;

    res.send(makeResponse(
      document.name,
      description,
      SERVER_URI+'search_emergency.jpg',
      document.url_kakaomap
    ));
    return;   
    
  }catch(err){
    res.send(makeTextResponse('egan api 오류'));
  }
})


function makeTextResponse(text){
  return {
    'contents': [
      {
        'type':'text',
        'text':text
      }
    ]
  };
}
function makeResponse(title, description, imageURL, buttonURL){
  return {
    "version": "2.0",
    "template": {
      "outputs": [
        {
          "basicCard": {
            "title": title,
            "description": description,
            "thumbnail": {
              "imageUrl": imageURL
            },
            "buttons": [
              {
                "action":  "webLink",
                "label": "브라우저로 위치 확인",
                "webLinkUrl": buttonURL
              }
            ]
          }
        }
      ]
    }
  }
}
