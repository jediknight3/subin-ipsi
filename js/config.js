/**
 * 설정 파일
 * Google Apps Script 배포 후 받은 웹 앱 URL을 아래에 붙여넣으세요.
 * (예: https://script.google.com/macros/s/AKfycby.../exec)
 *
 * 비워두면 LocalStorage 모드로 동작 (인터넷 끊겨도 폰에 저장됨).
 */
window.CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbw7rdsxym29cIFQM3al1gOm_i0OvTSGSPX5q1f10dFIyst5EKrBRZ7kAW-GmuYMkeGGYQ/exec',
  STUDENT_NAME: '최수빈',
  // 수시 8개교 종료, 2026.11 이후 정시 중심으로 전환
  SEONGJEOKPYO_DATE: '2026-12-11',  // 수능 성적표(표준점수) 발표
  JEONGSI_WONSEO_DATE: '2027-01-04', // 정시 원서접수 시작(가·나·다군)
  JEONGSI_MAGAM_DATE: '2027-01-07',  // 정시 원서접수 마감(가·나·다군)
  ADDGROUP_DATE: '2027-02-19',       // 정시 이후 추가모집 시작 (예상)
  TARGET_GRADE: 5.5                  // 목표 평균등급
};
