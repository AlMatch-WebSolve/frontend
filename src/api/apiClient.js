import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/', // Vite 프록시 설정 사용
  withCredentials: true, // 모든 요청에 쿠키를 자동으로 포함시키는 핵심 설정
});

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => response, // 성공 응답은 그대로 반환
  async (error) => {
    // 원래 요청했던 정보를 저장
    const originalRequest = error.config;

    // 401 에러가 발생했는데, 이 요청이 재시도된 요청이 아니라면
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('1️⃣ 401 에러 감지! 토큰 재발급을 시도합니다.');
      // 이 요청은 재시도된 요청임을 표시 (무한 루프 방지용)
      originalRequest._retry = true;

      try {
        console.log('2️⃣ 리프레시 토큰으로 새로운 액세스 토큰을 요청합니다.');
        // 토큰 재발급 API를 호출 (브라우저가 자동으로 refreshToken 쿠키 보냄)
        await axios.post(
          '/api/auth/refresh',
          {},
          {
            withCredentials: true,
          },
        );

        console.log('3️⃣ ✅ 토큰 재발급 성공! 원래 요청을 재시도합니다.');
        // 토큰 재발급이 성공했다면, 원래 실패했던 요청을 다시 실행
        // 새로운 accessToken은 쿠키에 저장되어 있으므로, 이 요청은 성공
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 만약 리프레시 토큰마저 만료되어 재발급에 실패했다면, 사용자는 정말로 다시 로그인해야 함
        console.error(
          '4️⃣ ❌ 리프레시 토큰 만료! 로그인 페이지로 이동합니다.',
          refreshError,
        );

        // 로그인 페이지로 리디렉션
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }

    // 401 에러가 아니거나, 재시도 요청 실패 시 에러를 그대로 반환
    console.error('🤔 401 에러가 아니거나, 재시도에 실패한 요청입니다.', error);
    return Promise.reject(error);
  },
);

export default apiClient;
