const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express().use(bodyParser.json());

app.use(express.static('public'));
app.listen(process.env.PORT || 80, 
  () => {
    console.log('hospital search server is listening');
});

app.get('/', (req, res) => {
  res.send('this server is for only chatbotskill');
});

app.post('/api/searchHospital', (req, res) => {
  const param = req.body;
  console.log(param);
  res.send(makeTextResponse('test'));
})

let catImage = 'http://k.kakaocdn.net/dn/vgnxa/btqq3mQAI0c/QRMTkWPkvXWun1qvOe7B8K/resize.jpg'
app.post('/webhook', (req, res) => {
  let input = req.body;
  console.log(JSON.stringify(input));
  if(input.intent.name === 'intent1'){
    console.log('intent1 is called');
    res.send(makeTextResponse('this is intent 1/one/월'));
  }else if(input.intent.name === 'intent2'){
    console.log('intent2 is called');
    res.send(makeCardImageResponse('고양이', catImage, '이것은 고양이 이미지'));
  }else {
    res.send(makeTextResponse('unknown intent name'));
  }
});

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
