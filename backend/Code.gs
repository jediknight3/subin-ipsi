/**
 * 수빈이 대입 준비 백엔드 (Google Apps Script)
 *
 * 사용법:
 *  1) sheets.google.com 에서 새 스프레드시트 만들기
 *  2) 확장 프로그램 → Apps Script 클릭
 *  3) 이 코드 전체를 붙여넣고 저장
 *  4) 상단 메뉴 "배포" → "새 배포" → 유형: 웹 앱
 *     - 실행: 나
 *     - 액세스: 모든 사용자
 *  5) 배포 후 표시되는 웹 앱 URL을 복사 → web/js/config.js 의 API_URL 에 붙여넣기
 *  6) 처음 1회: 함수 선택 드롭다운에서 initSheets 선택 후 ▶ 실행 (시트 자동 생성)
 */

const SHEET_NAMES = {
  todos: 'todos',
  grades: 'grades',
  schedule: 'schedule',
  universities: 'universities',
  interview: 'interview',
  notes: 'notes'
};

const HEADERS = {
  todos: ['id', 'who', 'category', 'title', 'due', 'priority', 'done', 'createdAt'],
  grades: ['id', 'year', 'sem', 'subject', 'score', 'avg', 'grade', 'note'],
  schedule: ['id', 'date', 'title', 'category', 'note'],
  universities: ['id', 'tier', 'name', 'major', 'admissionType', 'minimum', 'interview', 'memo', 'status', 'utype'],
  interview: ['id', 'q', 'a', 'tag'],
  notes: ['id', 'date', 'content']
};

/* ============================================================
 * 초기 셋업
 * ============================================================ */
function initSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(HEADERS).forEach(key => {
    let sh = ss.getSheetByName(SHEET_NAMES[key]);
    if (!sh) sh = ss.insertSheet(SHEET_NAMES[key]);
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, HEADERS[key].length).setValues([HEADERS[key]]);
      sh.setFrozenRows(1);
    }
  });
  // 기본 시트(Sheet1)가 비어있으면 삭제
  const def = ss.getSheetByName('Sheet1') || ss.getSheetByName('시트1');
  if (def && def.getLastRow() <= 1 && ss.getSheets().length > 1) {
    ss.deleteSheet(def);
  }
  seedInitialData();
}

function seedInitialData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 6개 대학 시드
  const u = ss.getSheetByName(SHEET_NAMES.universities);
  if (u.getLastRow() <= 1) {
    const seed = [
      ['u1', 'soshin',    '안양대',     '미디어콘텐츠학과',      '아리학종(서류+블라인드면접)', '없음', '서류70+면접30', '경기 안양 (1호선 안양역 도보). 남양주→1시간 30분. 블라인드면접 강점', '준비중', '4년제'],
      ['u2', 'soshin',    '한신대',     '미디어영상광고홍보학부', '참인재전형(학종)',            '없음', '서류70+면접30', '경기 오산 (1호선 오산역 셔틀). 남양주→2시간. 경쟁률 20:1 이상. 광고·미디어 학과 적합도 최고', '준비중', '4년제'],
      ['u3', 'jeokjeong', '강남대',     '미디어커뮤니케이션학과', '서류면접전형(학종)',           '없음', '서류70+면접30', '경기 용인 기흥 (분당선 기흥역 셔틀). 남양주→1시간 30분. 학종 집중 추천', '준비중', '4년제'],
      ['u4', 'anjun',     '서일대',     '영화방송공연예술학과',   '수시 실기+면접',              '없음', '실기+면접',     '서울 중랑구 면목동 (7호선 면목역 도보 5분). 남양주→40~50분 최단거리. 합격 내신 4.7~5.1등급', '준비중', '전문대'],
      ['u5', 'anjun',     '백석예술대', '공연예술경영과',         '수시 실기전형',               '없음', '실기70+교과30', '서울 서초구 방배동 (2호선 방배역 도보 5분). 남양주→1시간. 실기 70% 비중. 내신 불리 상쇄 가능', '준비중', '전문대'],
      ['u6', 'anjun',     '동서울대',   '엔터테인먼트경영과',     '일반전형(교과+면접)',          '없음', '교과+면접',     '경기 성남 복정 (8호선 복정역). 남양주→1시간. 비실기. 엔터·공연기획 학과 특화', '준비중', '전문대']
    ];
    u.getRange(2, 1, seed.length, seed[0].length).setValues(seed);
  }

  // 면접 Q&A 시드 (10개)
  const q = ss.getSheetByName(SHEET_NAMES.interview);
  if (q.getLastRow() <= 1) {
    const qa = [
      ['q1', '내신이 6등급대인데 우리 학과에서 잘 따라올 수 있나요?', '진로선택 문학과매체에서 96점 A를 받았습니다. 또 동아리에서 부기장으로 시나리오부터 조명·홍보까지 직접 기획해본 경험이 있어, 미디어 분야는 결과물로 평가받는 분야라고 생각하고 자신 있습니다.', '내신약점'],
      ['q2', '수상 경력이 없는데 적극성을 어떻게 보여줄 수 있나요?', '교내 대회 수상은 없지만 동아리 부기장으로서 학교 축제 연극을 기획·연출했고, 광고 프로젝트에서 학교 마스코트 굿즈 디자인을 주도했습니다. 공식 수상보다 직접 무대를 만든 경험이 더 의미 있다고 판단합니다.', '수상부재'],
      ['q3', '국어 성적이 5등급에서 6등급으로 떨어진 이유가 있나요?', '교과서 국어보다 매체 분석과 시나리오 창작, 실무 글쓰기에 시간을 더 투자했습니다. 그 결과 진로선택 문학과매체에서 96점을 받을 수 있었습니다. 우선순위를 진로 쪽에 두었습니다.', '내신약점'],
      ['q4', '광고기획과 공연기획 중 진짜 하고 싶은 분야는 무엇인가요?', '두 분야는 메시지를 시각·청각으로 설계한다는 본질이 같다고 생각합니다. 광고는 짧은 메시지, 공연은 긴 서사라는 차이가 있을 뿐입니다. 우리 학과에서 두 가지를 융합하는 인재가 되고 싶습니다.', '진로'],
      ['q5', '10년 후 자신의 모습을 그려본다면?', '공연 기획사에서 마케팅과 연출을 함께 담당하는 프로듀서가 되거나, 광고대행사에서 브랜드 이벤트를 기획하는 전략가가 되고 싶습니다. 두 분야 모두 사람의 마음을 움직이는 일이라는 공통점이 있습니다.', '비전'],
      ['q6', '우리 학과 커리큘럼 중 가장 듣고 싶은 과목은?', '(지원 학과 홈페이지에서 확인 후 작성) 예: 미디어 기획론, 광고 캠페인 분석, 영상 제작 실습', '학과지식'],
      ['q7', '동아리 활동 중 가장 의미 있었던 순간은?', '2학년 학교 축제에서 부기장으로 시나리오부터 무대 연출까지 총괄한 경험입니다. 후배에게 조명 노하우를 전수하고 역할을 분담하면서 함께 만드는 무대의 시너지를 느꼈습니다.', '동아리'],
      ['q8', '본인의 단점은?', '결정을 내리기까지 시간이 오래 걸리는 편입니다. 하지만 그만큼 신중하게 검토하기 때문에 한 번 결정한 후에는 흔들림 없이 추진하는 편입니다.', '인성'],
      ['q9', '왜 우리 학교를 선택했나요?', '(지원 학교별 차별화 포인트 조사 후 작성) 예: 학교의 미디어 실습 환경, 교수진의 업계 경력, 인근 방송사·광고사와의 산학협력', '지원동기'],
      ['q10', '마지막으로 하고 싶은 말이 있다면?', '제가 가장 자신 있는 것은 "끝까지 해내는 힘"입니다. 동아리에서 후배들이 포기하려 할 때 마지막까지 함께 무대를 완성한 경험처럼, 이 학과에서도 4년 내내 흔들림 없이 노력하겠습니다.', '마무리'],
      ['q11', '봉사활동이 모두 교내인데, 지역사회 기여 의지가 있나요?', '1·2학년 동안 환경정화, 급식 배식, 헌혈 등 교내에서 총 32시간 봉사했습니다. 작은 실천의 중요성을 배웠고, 3학년에는 남양주문화재단 같은 지역 기관에서 공연 기획 관련 외부 봉사로 확장하고 싶습니다.', '봉사'],
      ['q12', '헌혈 봉사를 한 이유가 있나요?', '특별한 준비 없이도 생명을 살릴 수 있는 봉사라 생각했습니다. 2학년 학교 헌혈 캠페인에 자발적으로 참여했고, 작은 행동이 누군가에게 큰 의미가 될 수 있다는 것을 체감했습니다.', '봉사'],
      ['q13', '동아리에서 부기장으로서 어려웠던 점은?', '시나리오 방향을 두고 부원들 의견이 엇갈렸을 때가 가장 어려웠습니다. 공청회 방식으로 의견을 모으고 제가 최종 조율했습니다. 기획자의 역할은 가장 좋은 아이디어를 고르는 것이 아니라 모든 의견을 하나의 방향으로 모으는 것임을 배웠습니다.', '동아리'],
      ['q14', '조명을 담당하게 된 계기는?', '1학년 때 조명 하나로 배우의 감정과 장면 분위기가 완전히 달라지는 것에 매료됐습니다. 기획·연출이 스토리를 만든다면 조명은 그 스토리를 관객의 감각으로 전달하는 도구라고 생각해 더 깊이 배우고 싶었습니다.', '동아리'],
      ['q15', '루미너스 동아리에서 후배에게 무엇을 전수했나요?', '조명 세팅 방법과 큐시트 작성법을 직접 가르쳤습니다. 단순 기술 전달이 아니라 왜 이 장면에 이 조명이 필요한지를 함께 생각하도록 유도했습니다. 후배들이 스스로 판단해 조명을 고를 수 있게 됐을 때 가장 뿌듯했습니다.', '동아리']
    ];
    q.getRange(2, 1, qa.length, qa[0].length).setValues(qa);
  }

  // 내신 시드
  const g = ss.getSheetByName(SHEET_NAMES.grades);
  if (g.getLastRow() <= 1) {
    const grades = [
      ['g1','1','1','국어',71,69.2,5,''],['g2','1','1','수학',60,67.3,6,''],['g3','1','1','영어',59,68.3,6,''],
      ['g4','1','1','한국사',57,70.0,7,''],['g5','1','1','통합사회',58,78.9,8,''],['g6','1','1','통합과학',53,73.9,7,''],
      ['g7','1','2','국어',77,73.0,5,''],['g8','1','2','수학',64,67.7,6,''],['g9','1','2','영어',63,74.6,6,''],
      ['g10','1','2','한국사',54,70.9,7,''],['g11','1','2','통합사회',67,74.9,6,''],['g12','1','2','통합과학',62,70.0,6,''],
      ['g13','2','1','문학',72,73.4,6,''],['g14','2','1','수학I',52,61.6,6,''],['g15','2','1','영어I',53,66.5,7,'⚠️ 7등급'],
      ['g16','2','1','세계지리',50,68.0,7,''],['g17','2','1','세계사',53,63.1,6,''],['g18','2','1','생활과윤리',71,69.9,5,''],
      ['g19','2','1','일본어I',45,70.0,8,'⚠️ 8등급'],
      ['g20','2','2','독서',67,71.4,6,''],['g21','2','2','수학II',44,63.1,6,''],['g22','2','2','영어II',61,69.2,6,''],
      ['g23','2','2','세계지리',56,69.8,7,''],['g24','2','2','세계사',72,67.8,5,''],['g25','2','2','생활과윤리',67,72.0,6,''],
      ['g26','2','2','일본어I',46,72.0,7,'']
    ];
    g.getRange(2,1,grades.length,grades[0].length).setValues(grades);
  }

  // 투두 시드
  const t = ss.getSheetByName(SHEET_NAMES.todos);
  if (t.getLastRow() <= 1) {
    const now = new Date().toISOString();
    const todos = [
      ['t1','부모','정보수집','6개 대학 2026 수시 모집요강 PDF 다운로드','2026-05-15','high',false,now],
      ['t2','부모','정보수집','각 대학 입학처 전화 - 수능최저·면접 확인','2026-05-20','high',false,now],
      ['t3','부모','학교소통','담임선생님(장수안) 1:1 상담 신청','2026-05-10','high',false,now],
      ['t4','부모','학교소통','학교 행정실에 정식 생기부 출력 요청','2026-05-08','high',false,now],
      ['t5','부모','정보수집','진학사 합격예측 서비스 결제','2026-05-25','mid',false,now],
      ['t6','부모','정보수집','외부 봉사기관 1곳 컨택 (남양주문화재단)','2026-05-25','high',false,now],
      ['t7','부모','면접준비','모의면접 학원/멘토 섭외','2026-07-15','mid',false,now],
      ['t8','부모','케어','수빈이 식단·수면 관리 시작','2026-05-05','mid',false,now],
      ['t9','수빈','내신','3학년 1학기 기말고사 학습계획 작성','2026-05-15','high',false,now],
      ['t10','수빈','비교과','교내 대회 1개 신청 (광고/UCC/발표)','2026-05-20','high',false,now],
      ['t11','수빈','비교과','외부 봉사 5~10시간 채우기','2026-07-20','high',false,now],
      ['t12','수빈','비교과','동아리(루미너스3)에서 핵심 역할 1개 맡기','2026-05-30','mid',false,now],
      ['t13','수빈','면접','면접 예상 질문 100개 답변 작성','2026-07-31','high',false,now],
      ['t14','수빈','면접','거울 앞 셀프 모의면접 영상 촬영','2026-08-10','mid',false,now],
      ['t15','수빈','면접','6개 대학 학과 커리큘럼 정리','2026-08-15','mid',false,now],
      ['t16','수빈','내신','국어 매체 인강 1개 결제 + 진도 시작','2026-05-12','mid',false,now],
      ['t17','수빈','멘탈','매일 5분 일기 쓰기','2026-05-05','low',false,now],
      ['t18','부모','정시준비','정시 대상 대학 수능최저 등급 조사 (대진대·호원대·청운대 등)','2026-06-30','high',false,now],
      ['t19','부모','정시준비','EBS 연계교재 국어·영어 구매','2026-05-20','mid',false,now],
      ['t20','수빈','정시준비','6월 모의고사 응시 후 등급 확인','2026-06-11','high',false,now],
      ['t21','수빈','정시준비','9월 모의고사 응시 후 정시 지원 여부 최종 결정','2026-09-03','high',false,now],
      ['t22','수빈','정시준비','수능 국어·영어 취약 단원 집중 복습','2026-08-31','high',false,now],
      ['t23','부모','정시준비','정시 지원 대학 목록 최종 확정 (수시 결과 후)','2026-12-20','mid',false,now]
    ];
    t.getRange(2,1,todos.length,todos[0].length).setValues(todos);
  }

  // 일정 시드 (주요 입시 마일스톤)
  const s = ss.getSheetByName(SHEET_NAMES.schedule);
  if (s.getLastRow() <= 1) {
    const sched = [
      ['s1','2026-06-25','3학년 1학기 기말고사 시작','내신','마지막 내신 기회'],
      ['s2','2026-09-09','수시 원서 접수 시작','원서','D-day 구간 진입'],
      ['s3','2026-09-13','수시 원서 접수 마감','원서','어디가 발표 후 정확 일정 확인'],
      ['s4','2026-11-19','2027학년도 수능','수능','수능최저 있는 전형 대비'],
      ['s5','2026-12-15','수시 합격 발표 (대학별 상이)','발표',''],
      ['s6','2026-08-31','생기부 마감','생기부','3학년 세특 마감일'],
      ['s7','2026-06-11','6월 모의고사','수능','정시 방향 판단 기준점'],
      ['s8','2026-09-03','9월 모의고사','수능','정시 지원 여부 최종 판단'],
      ['s9','2026-12-27','정시 원서 접수 시작 (예상)','원서','수시 미등록 시 정시 준비'],
      ['s10','2027-01-06','정시 원서 접수 마감 (예상)','원서','대진대·호원대·청운대 등 확인']
    ];
    s.getRange(2,1,sched.length,sched[0].length).setValues(sched);
  }
}

/* ============================================================
 * Web API (GET = 조회, POST = 저장/수정/삭제)
 * ============================================================ */
function doGet(e) {
  try {
    const sheet = (e.parameter.sheet || '').toLowerCase();
    if (!HEADERS[sheet]) return _json({ ok: false, err: 'invalid sheet' });
    const data = _readAll(sheet);
    return _json({ ok: true, data });
  } catch (err) {
    return _json({ ok: false, err: String(err) });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const sheet = (body.sheet || '').toLowerCase();
    const action = body.action; // 'upsert' | 'delete' | 'bulkSet'
    if (!HEADERS[sheet]) return _json({ ok: false, err: 'invalid sheet' });

    if (action === 'upsert') {
      _upsert(sheet, body.row);
    } else if (action === 'delete') {
      _delete(sheet, body.id);
    } else if (action === 'bulkSet') {
      _bulkSet(sheet, body.rows);
    } else {
      return _json({ ok: false, err: 'unknown action' });
    }
    return _json({ ok: true, data: _readAll(sheet) });
  } catch (err) {
    return _json({ ok: false, err: String(err) });
  }
}

function _readAll(sheet) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_NAMES[sheet]);
  const rng = sh.getDataRange().getValues();
  if (rng.length < 2) return [];
  const head = rng[0];
  return rng.slice(1).filter(r => r[0] !== '').map(r => {
    const obj = {};
    head.forEach((h, i) => { obj[h] = r[i]; });
    return obj;
  });
}

function _upsert(sheet, row) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_NAMES[sheet]);
  const head = HEADERS[sheet];
  const data = sh.getDataRange().getValues();
  const idCol = 0;
  let rowIdx = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][idCol] === row.id) { rowIdx = i + 1; break; }
  }
  const values = head.map(h => row[h] !== undefined ? row[h] : '');
  if (rowIdx > 0) {
    sh.getRange(rowIdx, 1, 1, head.length).setValues([values]);
  } else {
    sh.appendRow(values);
  }
}

function _delete(sheet, id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_NAMES[sheet]);
  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) { sh.deleteRow(i + 1); return; }
  }
}

function _bulkSet(sheet, rows) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_NAMES[sheet]);
  const head = HEADERS[sheet];
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, head.length).clear();
  if (!rows || !rows.length) return;
  const values = rows.map(r => head.map(h => r[h] !== undefined ? r[h] : ''));
  sh.getRange(2, 1, values.length, head.length).setValues(values);
}

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
