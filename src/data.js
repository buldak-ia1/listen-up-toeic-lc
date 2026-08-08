import { groupTranscripts } from './transcripts.js'
import { additionalQuestions } from './generatedQuestions.js'

const letters = ['A', 'B', 'C', 'D']

const part1 = [
  {
    id: 1,
    type: '인물 동작 묘사',
    difficulty: '중',
    answer: 'B',
    image: '/images/test1/q1.webp',
    options: ['The woman is carrying a tray of food.', 'The woman is wearing a jacket.', 'The woman is tying up her hair.', 'The woman is removing her hat.'],
    evidence: 'The woman is wearing a jacket.',
    explanation: '여자가 재킷을 입고 있는 상태를 정확히 묘사합니다. be wearing은 현재 입고 있는 상태를 나타냅니다.',
    trap: '사진 속 소지품이나 머리 모양을 실제 동작으로 착각하지 않는 것이 핵심입니다.',
    keywords: ['wear a jacket', 'carry a tray', 'tie up'],
  },
  {
    id: 2,
    type: '복수 인물 동작',
    difficulty: '중',
    answer: 'D',
    image: '/images/test1/q2.webp',
    options: ['Some people are standing next to a filing cabinet.', 'Some people are searching through a desk.', 'Some people are watching a presentation.', 'Some people are looking at a book.'],
    evidence: 'Some people are looking at a book.',
    explanation: '두 사람이 테이블에 앉아 책을 함께 보고 있으므로 (D)가 가장 정확합니다.',
    trap: '사무실 배경에서 연상되는 filing cabinet, presentation 같은 사진에 없는 명사를 경계하세요.',
    keywords: ['look at a book', 'presentation', 'filing cabinet'],
  },
  {
    id: 3,
    type: '사람·배경 혼합 묘사',
    difficulty: '상',
    answer: 'C',
    image: '/images/test1/q3.webp',
    options: ['A woman is holding a phone up to her ear.', 'A woman is pouring a beverage into a glass.', 'Some light fixtures are hanging from the ceiling.', 'Some tiles are being installed in a hallway.'],
    evidence: 'Some light fixtures are hanging from the ceiling.',
    explanation: '천장에 여러 조명이 매달려 있는 상태가 사진 전체에서 명확하게 보입니다.',
    trap: '전경의 사람보다 배경 사물의 상태가 정답 근거가 될 수 있습니다.',
    keywords: ['light fixture', 'hang from', 'ceiling'],
  },
  {
    id: 4,
    type: '사람·사물 혼합 묘사',
    difficulty: '중',
    answer: 'A',
    image: '/images/test1/q4.webp',
    options: ['A wooden crate is filled with vegetables.', 'One of the men is putting vegetables into a shopping bag.', 'A backpack has been set on the ground.', 'One of the men is reaching into a bucket.'],
    evidence: 'A wooden crate is filled with vegetables.',
    explanation: '사진 전경의 나무 상자가 채소로 가득 차 있는 상태가 정확한 묘사입니다.',
    trap: '손의 방향을 실제 동작으로 단정하지 말고 사진에서 완료된 상태를 먼저 확인하세요.',
    keywords: ['wooden crate', 'be filled with', 'vegetables'],
  },
  {
    id: 5,
    type: '사물 상태 묘사',
    difficulty: '중',
    answer: 'A',
    image: '/images/test1/q5.webp',
    options: ['Painting supplies have been laid out on the floor.', 'He’s laying a brush down on a windowsill.', 'He’s lifting a can of paint by its handle.', 'Cans of paint have been placed on a step stool.'],
    evidence: 'Painting supplies have been laid out on the floor.',
    explanation: '페인트 통과 도구가 바닥에 펼쳐져 있는 완료 상태를 묘사합니다.',
    trap: '남자의 손동작보다 바닥에 놓인 여러 도구의 배치를 보세요.',
    keywords: ['painting supplies', 'lay out', 'floor'],
  },
  {
    id: 6,
    type: '풍경 묘사',
    difficulty: '중',
    answer: 'C',
    image: '/images/test1/q6.webp',
    options: ['A path is covered with fallen branches.', 'A tree is lying across a grassy area.', 'Some water has pooled on a path.', 'Some cyclists are riding through a field.'],
    evidence: 'Some water has pooled on a path.',
    explanation: '길 위에 물이 고여 있는 모습이 분명하므로 (C)가 정답입니다.',
    trap: '풍경 사진에서는 사진에 없는 사람이나 사물을 넣은 선택지가 자주 출제됩니다.',
    keywords: ['pool on', 'path', 'grassy area'],
  },
]

const part2Raw = [
  [7, 'Where is the conference being held?', ['A three-day vacation.', 'At the Riverview Hotel.', 'In the supply cabinet.'], 'B', 'Where 의문문', '장소를 묻는 질문에 구체적인 호텔 이름으로 응답합니다.'],
  [8, 'When does the warehouse manager arrive?', ['Sure, no problem.', 'About twelve shipping boxes.', 'Not until this afternoon.'], 'C', 'When 의문문', 'Not until this afternoon은 도착 시점을 간접적으로 알려 줍니다.'],
  [9, 'There’s a nice park nearby, right?', ['Did you order paper for the copier?', 'Yes—it’s next to Greendale Lake.', 'They’re in the parking garage.'], 'B', '부가 의문문', 'Yes로 확인한 뒤 next to로 구체적인 위치를 덧붙였습니다.'],
  [10, 'Who sent the meeting minutes to the accounting department?', ['Our office assistant.', 'They have a savings account.', 'Cash and credit cards.'], 'A', 'Who 의문문', '사람을 묻는 질문에 직책으로 답한 (A)가 자연스럽습니다.'],
  [11, 'I’d like to know what you think of our new finance analyst.', ['I’ve prepared the decorations for tomorrow.', 'He seems very competent.', 'It’s finally stopped raining.'], 'B', '의견 요청', '새 분석가에 대한 의견을 묻는 말에 competent라고 평가했습니다.'],
  [12, 'Let’s go on the company retreat.', ['Oh, did he?', 'Yes, that’s a good idea.', 'He tried to solve that problem.'], 'B', '제안·권유', 'Let’s 제안에 동의하는 가장 직접적이고 자연스러운 응답입니다.'],
  [13, 'What time can I pick up my glasses?', ['No, it’s not very heavy.', 'About twenty meters.', 'We close at six o’clock.'], 'C', '간접 응답', '마감 시간을 알려 주어 그 전에 방문해야 함을 우회적으로 답합니다.'],
  [14, 'The sales team knows how to use the tracking software, don’t they?', ['It’s on the lower shelf.', 'A twelve-thirty departure.', 'I haven’t seen them using it yet.'], 'C', '부가 의문문', '사용하는 것을 본 적이 없다는 말로 자신도 확신하지 못함을 나타냅니다.'],
  [15, 'Are you going to the hardware store on Mill Street?', ['That store hasn’t opened yet.', 'The blue package you sent me.', 'Some nails and a hammer.'], 'A', '간접 응답', '가게가 아직 열지 않았다는 이유로 가지 않는다는 뜻을 전달합니다.'],
  [16, 'Would you be able to write the introduction for the workshop?', ['That was a great book.', 'OK, I’d be happy to.', 'He doesn’t have any more.'], 'B', '요청', '요청을 기꺼이 수락하는 응답입니다.'],
  [17, 'I picked up some flowers for Tunji’s retirement party.', ['No, pick any day.', 'That was thoughtful.', 'A delivery driver.'], 'B', '정보 전달', '꽃을 준비한 행동에 대해 사려 깊다고 칭찬합니다.'],
  [18, 'Which meeting room did you tell the interns to go to?', ['The Jefferson Room.', 'The meeting was fun, thanks.', 'Yes, it’s a conference call.'], 'A', 'Which 의문문', '특정 회의실 이름으로 응답합니다.'],
  [19, 'Is your dental appointment next Tuesday?', ['You can borrow mine.', 'I’ll have to check my calendar.', 'Yes, it was a good meeting.'], 'B', '간접 응답', '일정표를 확인해야 한다는 말로 아직 확실하지 않음을 나타냅니다.'],
  [20, 'Why aren’t there any brochures in the lobby?', ['No, I haven’t received my confirmation e-mail yet.', 'My winter coat.', 'Because someone just took the last one.'], 'C', 'Why 의문문', '안내 책자가 없는 직접적인 이유를 설명합니다.'],
  [21, 'What’s the process for submitting my expense report?', ['You send it to the finance department.', 'The end of the day.', 'That’s correct.'], 'A', '절차 질문', '재무팀에 보내라는 구체적인 절차를 안내합니다.'],
  [22, 'Do you sell your products online or in stores?', ['About twenty percent off.', 'A product demonstration.', 'Only online.'], 'C', '선택 의문문', 'online과 in stores 중 하나를 선택해 답합니다.'],
  [23, 'How often do you charge this device?', ['Whenever the light turns red.', 'A wireless one.', 'At the hardware store.'], 'A', 'How often 의문문', '표시등이 빨간색이 될 때마다라는 빈도로 답합니다.'],
  [24, 'The tickets to Friday night’s concert cost ten dollars each.', ['Actually, they’re fifteen.', 'No, I can’t play the guitar.', 'It’s in aisle five.'], 'A', '정보 정정', 'Actually로 앞선 가격 정보를 바로잡습니다.'],
  [25, 'Can’t you update the database today?', ['I did it yesterday.', 'That’s an interesting movie.', 'No, just me.'], 'A', '부정 의문문', '어제 이미 했다는 말로 오늘 할 필요가 없음을 간접적으로 알립니다.'],
  [26, 'How are we going to fit the extra supplies in that closet?', ['I’ve already read them.', 'Natalie’s in charge of supplies.', 'It’s the door at the end of the hallway.'], 'B', '간접 응답', '물품 담당자가 따로 있다는 관련 정보로 답합니다.'],
  [27, 'Have all the new windows been installed?', ['Sure, I’ll close the blinds.', 'The construction crew is almost finished.', 'This isn’t the tallest ladder available.'], 'B', '완료 여부', '작업팀이 거의 끝냈다는 말로 아직 완전히 끝나지는 않았음을 답합니다.'],
  [28, 'Would you rather go to lunch now or at noon?', ['I’m taking a client to lunch.', 'On the corner of Fourth and Main.', 'The daily special is soup and a sandwich.'], 'A', '선택 의문문', '두 선택지 중 하나 대신 이미 다른 점심 약속이 있음을 알려 줍니다.'],
  [29, 'You’re taking the training in the afternoon, aren’t you?', ['The new head of the accounting department.', 'No, I take my coffee black.', 'Well, it depends on my schedule.'], 'C', '부가 의문문', '일정에 달려 있다며 확정되지 않았음을 나타냅니다.'],
  [30, 'Shouldn’t Ms. Ishida look over the financial projections?', ['I just got this monitor.', 'To the south entrance.', 'I’m meeting with her at ten.'], 'C', '부정 의문문', '10시에 만난다는 말로 그때 확인하겠다는 의미를 전달합니다.'],
  [31, 'When are you going to choose a new project manager?', ['The projector’s not working correctly.', 'Next to the front entrance.', 'I’m really busy this week.'], 'C', '간접 응답', '이번 주에 바쁘다는 말로 그 이후에 선택할 수 있음을 우회적으로 답합니다.'],
]

const part2 = part2Raw.map(([id, prompt, options, answer, type, explanation]) => ({
  id, prompt, options, answer, type, explanation, difficulty: id % 4 === 0 ? '상' : '중',
  evidence: options[letters.indexOf(answer)],
  trap: answer === 'C' ? '질문의 핵심 의문사보다 반복되는 단어에 끌리지 마세요.' : '직접적인 Yes/No보다 상황에 맞는 간접 응답을 확인하세요.',
  keywords: prompt.split(' ').filter((word) => word.length > 5).slice(0, 3),
}))

const part3Sample = [
  {
    id: 32,
    prompt: 'What type of food product does the speakers’ company sell?',
    options: ['Candy', 'Cheese', 'Bread', 'Pasta'],
    answer: 'B',
    type: '주제·업종 파악',
    difficulty: '중',
    evidence: 'our new spicy Cheddar cheese',
    explanation: 'Cheddar cheese와 company’s line of cheeses가 반복되어 회사의 제품을 알 수 있습니다.',
    trap: 'recipes, sauces 같은 주변 단어보다 반복되는 핵심 명사를 잡으세요.',
    keywords: ['Cheddar cheese', 'product line', 'focus group'],
    transcript: [
      ['W', 'Hey, Oliver. Did you see the focus group results for our new spicy Cheddar cheese? Everyone really liked it.'],
      ['M', 'Yes. It should be a great addition to our company’s line of cheeses.'],
      ['W', 'Several people mentioned that they’d like to use it in recipes—to add to sauces, for example.'],
      ['M', 'So maybe we should consider selling a shredded version that would melt easily when cooked.'],
      ['W', 'I’m sure we could do that. I’ll get in touch with the production manager with that request.'],
    ],
  },
  {
    id: 33,
    prompt: 'What does the man suggest?',
    options: ['Lowering prices', 'Hiring more workers', 'Publishing a recipe', 'Offering additional options'],
    answer: 'D', type: '제안 내용 파악', difficulty: '상',
    evidence: 'consider selling a shredded version',
    explanation: 'shredded version을 추가로 판매하자는 제안은 제품 선택지를 늘리자는 의미입니다.',
    trap: 'recipe라는 단어가 들리지만 조리법을 출판하자는 내용은 아닙니다.',
    keywords: ['consider -ing', 'shredded version', 'melt easily'],
  },
  {
    id: 34,
    prompt: 'What does the woman say she will do?',
    options: ['Send a schedule update', 'Contact a production manager', 'Visit the company headquarters', 'Plan an advertising campaign'],
    answer: 'B', type: '다음 행동 예측', difficulty: '중',
    evidence: 'I’ll get in touch with the production manager',
    explanation: 'get in touch with는 contact와 같은 의미의 패러프레이징입니다.',
    trap: 'I’ll 뒤의 행동 표현과 선택지의 동의어를 연결하세요.',
    keywords: ['get in touch with', 'production manager', 'request'],
  },
]

const test1Answers = 'B D C A A C B C B A B B C C A B B A B C A C A A A B B A C C C B D B C A D A D A C D B C C A A D C C B A C A B B A C A C B C C D D A C B A C B C A B D A B D A D A B D A D A B C D B C B A D A C D D C A'.split(' ')

const groupSamples = {
  35: ['Why is the man calling?', ['To sign up for lessons', 'To enter a competition', 'To buy tickets to an event', 'To ask about branded merchandise'], 'C', '대화 목적'],
  36: ['What did Ife Rotimi do last month?', ['She won a regional tournament.', 'She gave a television interview.', 'She started an institute.', 'She hired a new coach.'], 'A', '세부 정보'],
  37: ['What does the woman say is required?', ['A parking permit', 'A photo ID', 'Contact information', 'Advance payment'], 'D', '세부 정보'],
  38: ['What event are the speakers planning?', ['A fund-raising dinner', 'An art gallery opening', 'An awards ceremony', 'A children’s book fair'], 'A', '행사 추론'],
  39: ['What task does the woman ask the man to help with?', ['Arranging a shuttle service', 'Choosing a catering firm', 'Preparing a speech', 'Sending out invitations'], 'D', '요청 사항'],
  40: ['What does the woman say she will do?', ['E-mail a list', 'Speak with a colleague', 'Provide a password', 'Post a job opening'], 'A', '다음 행동'],
  41: ['What event are the speakers preparing for?', ['A new-employee orientation', 'A grand opening', 'A community festival', 'A trade show'], 'C', '행사 추론'],
  42: ['What is mentioned about some pens?', ['They are available in multiple colors.', 'They use permanent ink.', 'They are preferred by book authors.', 'They are made from paper.'], 'D', '세부 정보'],
  43: ['What does the woman offer to do?', ['Reserve a booth', 'Place an order', 'Organize a focus group', 'Revise a budget'], 'B', '제안 파악'],
  44: ['Where does the woman work?', ['At a delivery service', 'At an electronics store', 'At a recycling facility', 'At a real estate agency'], 'C', '장소·직업 추론'],
  45: ['What does the man want to dispose of?', ['Yard waste', 'Used furniture', 'Electronics', 'Books'], 'C', '세부 정보'],
  46: ['What does the woman say can be found on a Web site?', ['A list of companies', 'Hours of operation', 'A permit application', 'Directions to a site'], 'A', '세부 정보'],
  47: ['How do the speakers know each other?', ['They took a class together.', 'They used to work for the same company.', 'They grew up in the same neighborhood.', 'They met on a train.'], 'A', '관계 추론'],
  48: ['What type of business does the man most likely own?', ['A fitness center', 'A real estate agency', 'A culinary school', 'A bakery'], 'D', '직업 추론'],
  49: ['What advantage does the woman point out about a rental space?', ['Its price', 'Its size', 'Its location', 'Its design'], 'C', '세부 정보'],
  50: ['Who most likely are the speakers?', ['Film actors', 'Museum directors', 'Video game developers', 'Investigative journalists'], 'C', '화자 추론'],
  51: ['What did the man recently do?', ['He secured some funding.', 'He tested a product.', 'He read a script.', 'He conducted an interview.'], 'B', '세부 정보'],
  52: ['What does the woman suggest?', ['Consulting a colleague', 'Planning an event', 'Negotiating a contract', 'Giving a client an update'], 'A', '제안 파악'],
  53: ['Who most likely is the man?', ['A delivery driver', 'A security guard', 'A maintenance worker', 'A customer service representative'], 'C', '직업 추론'],
  54: ['What problem does the woman describe?', ['A device is malfunctioning.', 'A key is missing.', 'A parking area is unavailable.', 'A package was not received.'], 'A', '문제점 파악'],
  55: ['What does the woman mean when she says, “it’s supposed to be below freezing tonight”?', ['She is surprised by the weather forecast.', 'She wants a service to be completed sooner.', 'She will move some items indoors.', 'She would prefer to park near her apartment.'], 'B', '화자 의도'],
  56: ['Why do the men want to speak to the woman?', ['To review a building design', 'To discuss a loan', 'To develop an advertising plan', 'To purchase some supplies'], 'B', '대화 목적'],
  57: ['What type of business do the men own?', ['A sports equipment store', 'A winter apparel store', 'An automobile dealership', 'A hotel chain'], 'A', '업종 추론'],
  58: ['According to the men, what has changed recently?', ['Roads have become more accessible.', 'Costs have decreased.', 'Tourism has increased.', 'Weather patterns have shifted.'], 'C', '세부 정보'],
  59: ['What does the man want to do?', ['Provide training opportunities', 'Upgrade machinery', 'Hire additional employees', 'Reorganize the factory layout'], 'A', '목적 파악'],
  60: ['What is the woman concerned about?', ['Increasing expenses', 'Introducing errors', 'Reducing productivity', 'Causing confusion'], 'C', '우려 사항'],
  61: ['What does the man mean when he says, “High-quality video can be recorded and edited with a smartphone”?', ['A new policy should be established.', 'An idea is easy to implement.', 'Data security is a concern.', 'Some information should be verified.'], 'B', '화자 의도'],
  62: ['Where is the woman?', ['At a restaurant', 'At a travel agency', 'At an airport', 'At a warehouse'], 'C', '장소 추론'],
  63: ['Look at the graphic. When does the woman prefer to meet with an investor?', ['On Monday', 'On Tuesday', 'On Wednesday', 'On Thursday'], 'C', '시각 자료 연계'],
  64: ['What good news does the man share?', ['A colleague received a promotion.', 'A conference proposal was accepted.', 'An airline ticket has been upgraded.', 'A company won an award.'], 'D', '세부 정보'],
  65: ['Where do the speakers work?', ['At an amusement park', 'At an art museum', 'At a concert hall', 'At a botanical garden'], 'D', '장소 추론'],
  66: ['Look at the graphic. Which page on the Web site does the man want to change?', ['Page 1', 'Page 2', 'Page 3', 'Page 4'], 'A', '시각 자료 연계'],
  67: ['Why does the woman say she cannot complete a task until Monday?', ['She requires approval from a manager.', 'She is attending a workshop.', 'Some software is being updated.', 'Some clients will be arriving soon.'], 'C', '이유 파악'],
  68: ['What news does the man share?', ['A station road will be closed for repair.', 'A project has been approved.', 'A parking area has been expanded.', 'An office will relocate.'], 'B', '세부 정보'],
  69: ['Look at the graphic. Where do the speakers decide to install some bicycle racks?', ['Near the covered parking area', 'Near the long-term parking area', 'Near the short-term parking area', 'Near the overflow parking area'], 'A', '시각 자료 연계'],
  70: ['Why does the woman say she will contact some companies?', ['To arrange a loan', 'To apply for a permit', 'To ask for estimates', 'To create a proposal'], 'C', '목적 파악'],
  71: ['What type of products does the business repair?', ['Computers', 'Vehicles', 'Light fixtures', 'Kitchen appliances'], 'B', '주제 파악'],
  72: ['What special benefit does the speaker mention?', ['Free pickup', 'Online scheduling', 'Extended warranties', 'A membership loyalty program'], 'C', '세부 정보'],
  73: ['Why will a business close on Friday?', ['For an inventory count', 'For employee training', 'For a company celebration', 'For equipment installation'], 'A', '이유 파악'],
  74: ['Who most likely is the speaker?', ['A facilities manager', 'A human resources representative', 'A security officer', 'A corporate executive'], 'B', '화자 추론'],
  75: ['According to the speaker, what will the listeners find in a binder?', ['A map of the building', 'An employment contract', 'An identification badge', 'Log-in credentials'], 'D', '세부 정보'],
  76: ['What does the speaker say about department files?', ['They are only accessible from company computers.', 'They must be password protected.', 'They must follow a specific naming convention.', 'They must be archived annually.'], 'A', '세부 정보'],
  77: ['Where does the speaker work?', ['At a laundry facility', 'At an amusement park', 'At a sports stadium', 'At a fitness center'], 'B', '장소 추론'],
  78: ['What does the speaker say about an item she ordered a month ago?', ['It arrived later than expected.', 'It was damaged during delivery.', 'She needs help assembling it.', 'She is pleased with it.'], 'D', '세부 정보'],
  79: ['What does the speaker ask the listener to confirm?', ['Whether a new product will be available soon', 'When a replacement part will be shipped', 'How long a warranty lasts', 'Who to contact about future orders'], 'A', '요청 사항'],
  80: ['What type of product does the speaker’s company make?', ['Furniture', 'Luggage', 'Bedding', 'Clothing'], 'D', '주제 파악'],
  81: ['What does the speaker recommend doing?', ['Manufacturing some products locally', 'Offering free shipping', 'Participating in a trade show', 'Developing a new product line'], 'A', '제안 파악'],
  82: ['What will happen at the next meeting?', ['A vote will take place.', 'A consultant will give a presentation.', 'Some contracts will be updated.', 'Safety procedures will be reviewed.'], 'B', '다음 행동'],
  83: ['What is the announcement mainly about?', ['A promotional event', 'A vacation package', 'A building renovation', 'A travel delay'], 'D', '주제 파악'],
  84: ['Why does the speaker say, “A bus will be departing for that destination in fifteen minutes”?', ['To suggest an alternative arrangement', 'To explain an extended wait time', 'To recommend changing the travel date', 'To inform customers about a new destination'], 'A', '화자 의도'],
  85: ['What does the speaker remind the listeners about?', ['How to download a mobile application', 'Where a waiting area is located', 'How to reserve tickets', 'Where to buy food'], 'D', '세부 정보'],
  86: ['Where does the speaker most likely work?', ['At a graphic design company', 'At a law firm', 'At a photography studio', 'At a museum'], 'A', '장소 추론'],
  87: ['What did the listener receive by e-mail?', ['A newsletter', 'Some images', 'An invoice', 'Some contracts'], 'B', '세부 정보'],
  88: ['Why is the speaker unavailable next week?', ['She will be working at another branch.', 'She will be with other clients.', 'She will be on vacation.', 'She will be at an industry conference.'], 'C', '이유 파악'],
  89: ['Who most likely are the listeners?', ['Investors', 'Government officials', 'Engineers', 'Journalists'], 'D', '청자 추론'],
  90: ['What does the speaker mean when she says, “All of ours are at least ten years old”?', ['An event needs to be relocated.', 'An upgrade is not feasible.', 'A project team has a lot of experience.', 'Some company policies are outdated.'], 'B', '화자 의도'],
  91: ['According to the speaker, what can be requested by e-mail?', ['Some presentation slides', 'Some product samples', 'A report summary', 'A discounted ticket'], 'C', '세부 정보'],
  92: ['What does the speaker want to do?', ['Increase online sales', 'Upgrade a payment system', 'Create a new product line', 'Add store locations'], 'B', '목적 파악'],
  93: ['According to the speaker, what is the customers’ main complaint?', ['Long lines', 'High prices', 'Unavailable items', 'Unfriendly staff'], 'A', '세부 정보'],
  94: ['Why does the speaker say, “that’s our busiest location”?', ['To request some feedback', 'To compliment some staff', 'To express frustration', 'To justify a choice'], 'D', '화자 의도'],
  95: ['According to the speaker, what is special about the Reston Office Tower?', ['It features an indoor garden.', 'It exhibits work from local artists.', 'It runs on solar power.', 'It has won many awards.'], 'A', '세부 정보'],
  96: ['Look at the graphic. Which floors will be occupied in January?', ['Floors 1–5', 'Floors 6–10', 'Floors 11–14', 'Floors 15–17'], 'C', '시각 자료 연계'],
  97: ['What does the speaker say is available on a Web site?', ['Some photographs', 'An event schedule', 'A floor layout', 'A recorded interview'], 'D', '세부 정보'],
  98: ['Who most likely are the listeners?', ['Safety engineers', 'Laboratory technicians', 'Legal consultants', 'Business investors'], 'D', '청자 추론'],
  99: ['Look at the graphic. Where will a new mine be built?', ['Site 1', 'Site 2', 'Site 3', 'Site 4'], 'C', '시각 자료 연계'],
  100: ['What does the speaker say is the next step?', ['Applying for permits', 'Installing equipment', 'Hiring additional staff', 'Updating a manual'], 'A', '다음 행동'],
}

const visualMaterials = {
  63: { title: 'BUSINESS TRIP SCHEDULE', kind: 'table', rows: [['Tuesday · Noon', 'Facility tour'], ['Wednesday · 8:00 A.M.', 'Meeting with Chicago staff'], ['Thursday · 2:00 P.M.', 'Shareholder presentation'], ['Friday · 4:45 P.M.', 'Return flight']] },
  66: { title: 'WEB SITE OUTLINE', kind: 'table', rows: [['Page 1', 'About Us'], ['Page 2', 'Admission Tickets'], ['Page 3', 'General Rules'], ['Page 4', 'Exhibitions and Special Events']] },
  69: { title: 'STATION PARKING MAP', kind: 'map', rows: [['A', 'Covered parking'], ['B', 'Long-term parking'], ['C', 'Short-term parking'], ['D', 'Overflow parking']] },
  96: { title: 'RESTON OFFICE TOWER', kind: 'table', rows: [['Floors 1–5', 'Burger Incorporated'], ['Floors 6–10', 'Aegis Technologies'], ['Floors 11–14', 'Barnum Financial Services'], ['Floors 15–17', 'Heinkel Media Group']] },
  99: { title: 'MINERAL REPORT', kind: 'bars', rows: [['Site 1', '150'], ['Site 2', '270'], ['Site 3', '390'], ['Site 4', '410']] },
}

function audioFor(id) {
  if (id <= 31) return `/audio/test1/Test_01-${String(id).padStart(2, '0')}.mp3`
  const start = 32 + Math.floor((id - 32) / 3) * 3
  return `/audio/test1/Test_01-${start}-${start + 2}.mp3`
}

function partFor(id) {
  if (id <= 6) return 1
  if (id <= 31) return 2
  if (id <= 70) return 3
  return 4
}

function visualFor(id) {
  if (id >= 62 && id <= 64) return visualMaterials[63]
  if (id >= 65 && id <= 67) return visualMaterials[66]
  if (id >= 68 && id <= 70) return visualMaterials[69]
  if (id >= 95 && id <= 97) return visualMaterials[96]
  if (id >= 98 && id <= 100) return visualMaterials[99]
  return null
}

const known = [...part1, ...part2, ...part3Sample]

const test1Questions = Array.from({ length: 100 }, (_, index) => {
  const id = index + 1
  const exact = known.find((item) => item.id === id)
  const sample = groupSamples[id]
  const part = partFor(id)
  const optionCount = part === 2 ? 3 : 4
  const groupStart = part >= 3 ? 32 + Math.floor((id - 32) / 3) * 3 : null
  const fallback = exact || (sample ? {
    id,
    prompt: sample[0], options: sample[1], answer: sample[2], type: sample[3], difficulty: '중',
    evidence: sample[1][letters.indexOf(sample[2])],
    explanation: '핵심 표현과 선택지의 패러프레이징을 연결하면 정답을 찾을 수 있습니다.',
    trap: '들린 단어가 그대로 반복된 선택지보다 문맥상 같은 의미를 찾으세요.',
    keywords: ['key detail', 'paraphrasing', 'speaker intent'],
  } : {
    id,
    prompt: part <= 2 ? '음성을 듣고 가장 적절한 응답을 고르세요.' : `Questions ${32 + Math.floor((id - 32) / 3) * 3}–${34 + Math.floor((id - 32) / 3) * 3} refer to the following ${part === 3 ? 'conversation' : 'talk'}.`,
    options: letters.slice(0, optionCount).map((letter) => `선택지 ${letter}`),
    answer: test1Answers[id - 1],
    type: part === 3 ? '세부 정보 확인' : '주제·목적 파악',
    difficulty: id % 5 === 0 ? '상' : '중',
    evidence: '정답 근거는 학습 모드에서 스크립트와 함께 확인할 수 있습니다.',
    explanation: '실전 세트의 원문 음원을 듣고 핵심 정보와 패러프레이징을 확인하세요.',
    trap: '질문을 먼저 읽고 필요한 정보가 등장하는 순간에 집중하세요.',
    keywords: ['detail', 'purpose', 'paraphrasing'],
  })

  const transcript = fallback.transcript || (part === 1
    ? fallback.options.map((line, optionIndex) => [letters[optionIndex], line])
    : part === 2
      ? [['Q', fallback.prompt], ...fallback.options.map((line, optionIndex) => [letters[optionIndex], line])]
      : groupTranscripts[groupStart] || [['S', fallback.evidence]])

  const evidenceLine = part === 1
    ? Math.max(0, letters.indexOf(fallback.answer))
    : part === 2
      ? Math.max(1, letters.indexOf(fallback.answer) + 1)
      : Math.round(((id - groupStart) / 2) * Math.max(0, transcript.length - 1))

  return {
    ...fallback,
    id,
    test: 1,
    number: id,
    part,
    audio: audioFor(id),
    optionCount,
    label: `Part ${part}`,
    transcript,
    evidenceLine,
    visual: visualFor(id),
    evidenceRange: part <= 2 ? [.42, .72] : [.55, .78],
  }
})

const assetUrl = (path) => path ? `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}` : path

export const lcQuestions = [...test1Questions, ...additionalQuestions].map((question) => ({
  ...question,
  audio: assetUrl(question.audio),
  image: assetUrl(question.image),
  graphic: assetUrl(question.graphic),
}))

export const testMeta = Array.from({ length: 10 }, (_, index) => ({
  test: index + 1,
  title: `기출 TEST ${index + 1}`,
  count: 100,
}))

export const partMeta = [
  { part: 1, title: '사진 묘사', count: 6, accent: '#ff6b35', description: '사진의 핵심 동작과 상태를 빠르게 포착해요.', types: ['인물 동작', '사물·배경', '혼합 묘사'] },
  { part: 2, title: '질의응답', count: 25, accent: '#2e7d6f', description: '질문의 의도와 자연스러운 간접 응답을 익혀요.', types: ['의문사', '일반 의문문', '간접 응답'] },
  { part: 3, title: '짧은 대화', count: 39, accent: '#5267d7', description: '대화의 목적, 세부 정보, 다음 행동을 연결해요.', types: ['목적 파악', '세부 정보', '시각 자료'] },
  { part: 4, title: '설명문', count: 30, accent: '#9a5bc4', description: '발표와 안내의 구조를 따라 핵심 정보를 잡아요.', types: ['주제·목적', '화자·장소', '시각 자료'] },
]

export const initialWrongNotes = [
  { id: 14, cause: '간접 응답을 놓침', review: 1, due: '오늘', status: 'urgent' },
  { id: 32, cause: '핵심 명사를 놓침', review: 2, due: '오늘', status: 'urgent' },
  { id: 53, cause: '화자의 직업 추론', review: 1, due: '내일', status: 'soon' },
  { id: 69, cause: '시각 자료 연계', review: 3, due: '8월 5일', status: 'later' },
]

export const weeklyData = [
  { day: '월', value: 68, minutes: 22 },
  { day: '화', value: 72, minutes: 34 },
  { day: '수', value: 70, minutes: 18 },
  { day: '목', value: 78, minutes: 41 },
  { day: '금', value: 81, minutes: 29 },
  { day: '토', value: 86, minutes: 52 },
  { day: '일', value: 83, minutes: 16 },
]
