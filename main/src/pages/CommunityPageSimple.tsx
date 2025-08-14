export default function CommunityPageSimple() {
  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-text-main mb-4">커뮤니티</h1>
        <p className="text-text-secondary">
          요양보호사와 가족들이 함께 소통하는 공간입니다
        </p>
        
        <div className="mt-8 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">테스트 게시글</h2>
          <p className="text-text-muted">
            커뮤니티 페이지가 정상적으로 로드되었습니다.
          </p>
        </div>
      </div>
    </div>
  );
}