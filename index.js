const express = require('express');
const bodyParser = require('body-parser');
const rp = require('request-promise');

require('dotenv').config();
const KAKAO_KEY = process.env.KAKAO_KEY;
const app = express().use(bodyParser.json());

const KEYWORD_SEARCH_URI = 'https://dapi.kakao.com/v2/local/search/keyword.json';

app.use(express.static('public'));
app.listen(process.env.PORT || 80, 
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
    let page = 1;
    let nextLoop = true;

    //search open hospital
    while(nextLoop){
      let search_uri = KEYWORD_SEARCH_URI + 
        encodeURI('?query='+ department) + 
        '&x='+x+
        '&y='+y+
        '&category_group_code=HP8&radius=5000&sort=distance&page=' + page;
      page++;

      let response = await rp({
        uri: search_uri, 
        method: "GET", 
        headers: {
          'Authorization': KAKAO_KEY
        }
      });
      response = JSON.parse(response);

      if(response.meta.is_end){
        nextLoop = false;
      }
      let totalCount = response.meta.total_count;
      for(let index = 0; index < totalCount; index++){
        let document = response.documents[index];
        //크롤러로 모은 정보를 이용해 열려있는지 확인하기
        let description = `가장 가까운 ${department}입니다. \n\n병원명: ${document.place_name}\n위치 : ${document.address_name}`;
        if(document.phone !== undefined){
          description += `\n전화번호 : ${document.phone}`;
        }
        res.send(makeButtonResponse(
          description,
          'Daum 지도로 열기',
          document.place_url)); 
        return;   
      }
    }
    res.send(makeTextResponse(`근처에 열려있는 ${department}가 없습니다... `));
  }catch(err){
    res.send(makeTextResponse('지도 api 오류'));
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

  //search with kakao map api
  try{
    let page = 1;
    let nextLoop = true;

    //search open hospital
    while(nextLoop){
      let search_uri = KEYWORD_SEARCH_URI + 
        encodeURI('?query=약국') + 
        '&x='+x+
        '&y='+y+
        '&category_group_code=PM9&radius=5000&sort=distance&page=' + page;
      page++;

      let response = await rp({
        uri: search_uri, 
        method: "GET", 
        headers: {
          'Authorization': KAKAO_KEY
        }
      });
      response = JSON.parse(response);

      if(response.meta.is_end){
        nextLoop = false;
      }
      let totalCount = response.meta.total_count;
      for(let index = 0; index < totalCount; index++){
        let document = response.documents[index];
        //크롤러로 모은 정보를 이용해 열려있는지 확인하기
        let description = `가장 가까운 약국입니다. \n\n약국명: ${document.place_name}\n위치 : ${document.address_name}`;
        if(document.phone !== undefined){
          description += `\n전화번호 : ${document.phone}`;
        }
        res.send(makeButtonResponse(
          description,
          'Daum 지도로 열기',
          document.place_url)); 
        return;   
      }
    }
    res.send(makeTextResponse(`근처에 열려있는 약국이 없습니다... `));
  }catch(err){
    res.send(makeTextResponse('지도 api 오류'));
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

  //search with kakao map api
  try{
    let page = 1;
    let nextLoop = true;

    //search open hospital
    while(nextLoop){
      let search_uri = KEYWORD_SEARCH_URI + 
        encodeURI('?query=응급실') + 
        '&x='+x+
        '&y='+y+
        '&radius=5000&sort=distance&page=' + page;
      page++;

      let response = await rp({
        uri: search_uri, 
        method: "GET", 
        headers: {
          'Authorization': KAKAO_KEY
        }
      });
      response = JSON.parse(response);

      if(response.meta.is_end){
        nextLoop = false;
      }
      let totalCount = response.meta.total_count;
      console.log(response.documents);
      for(let index = 0; index < totalCount; index++){
        let document = response.documents[index];
        //크롤러로 모은 정보를 이용해 열려있는지 확인하기
        let description = `가장 가까운 응급실입니다. \n\n병원명: ${document.place_name}\n위치 : ${document.address_name}`;
        if(document.phone !== undefined){
          description += `\n전화번호 : ${document.phone}`;
        }
        res.send(makeButtonResponse(
          description,
          'Daum 지도로 열기',
          document.place_url)); 
        return;   
      }
    }
    res.send(makeTextResponse(`근처에 응급실이 없습니다... `));
  }catch(err){
    res.send(makeTextResponse('지도 api 오류'));
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
function makeButtonResponse(description, buttonDescript, buttonURL){
  return {"contents":[
      {
        "type":"card.text",
        "cards":[
          {
            "description":description,
            "buttons":[
              {
                "type":"url",
                "label":buttonDescript,
                "data":{
                  'url':buttonURL
                }
              }
            ]
          }
        ]
      }
    ]
  }
}
function makeCardImageResponse(title, image, desc) {
  return{
    'contents': [
      {
        'type': 'card.image',
        'cards': [
          {
            'imageUrl': image,
            'description': desc,
            'title': title,
            'linkUrl': {},
            'buttons':[
              {
                'type':'url',
                'label':'더보기',
                'data': {
                  'url': "https://search.daum.net/search?w=img&nil_search=btn&DA=NTB&enc=utf8&q=%EA%B3%A0%EC%96%91%EC%9D%B4"
                }
              }
            ]
          }
        ]
      }
    ]
  }
}
