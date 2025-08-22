import { useState } from 'react';
import { Search, Plus, Heart, MessageCircle, Share2, Eye, Clock, User, Pin, Fire } from 'lucide-react';

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  authorRole: string;
  category: string;
  createdAt: string;
  views: number;
  likes: number;
  comments: number;
  isPinned?: boolean;
  isHot?: boolean;
  tags: string[];
}

const mockPosts: Post[] = [
  {
    id: 1,
    title: "치매 어르신 돌봄 시 주의사항 공유드려요",
    content: "5년차 요양보호사입니다. 치매 어르신을 돌보면서 경험한 노하우를 공유하고 싶어요. 특히 밤에 배회하시는 분들 케어 방법에 대해...",
    author: "김요양",
    authorRole: "요양보호사",
    category: "돌봄 노하우",
    createdAt: "2시간 전",
    views: 234,
    likes: 45,
    comments: 12,
    isPinned: true,
    tags: ["치매", "야간돌봄", "노하우"]
  },
  {
    id: 2,
    title: "요양원 면접 준비 어떻게 하셨나요?",
    content: "내일 요양원 면접이 있는데 너무 긴장돼요. 어떤 질문들이 나오는지, 어떻게 준비하면 좋을지 조언 부탁드립니다.",
    author: "새내기보호사",
    authorRole: "구직자",
    category: "취업 정보",
    createdAt: "4시간 전",
    views: 156,
    likes: 23,
    comments: 18,
    isHot: true,
    tags: ["면접", "취업", "요양원"]
  },
  {
    id: 3,
    title: "어머니 요양원 입소 후기 (솔직 후기)",
    content: "어머니를 요양원에 모신 지 6개월이 되었습니다. 처음엔 죄책감이 많았는데, 지금은 정말 잘한 선택이었다고 생각해요...",
    author: "효자아들",
    authorRole: "보호자",
    category: "후기 & 경험담",
    createdAt: "6시간 전",
    views: 189,
    likes: 67,
    comments: 24,
    tags: ["요양원", "후기", "가족"]
  },
  {
    id: 4,
    title: "요양보호사 자격증 취득 후 첫 출근 준비물",
    content: "드디어 자격증을 취득했어요! 다음 주에 첫 출근인데, 무엇을 준비해야 할지 막막하네요. 선배님들 조언 부탁드려요.",
    author: "신입요양사",
    authorRole: "요양보호사",
    category: "취업 정보",
    createdAt: "8시간 전",
    views: 98,
    likes: 15,
    comments: 9,
    tags: ["신입", "준비물", "자격증"]
  },
  {
    id: 5,
    title: "재가 요양보호사 vs 시설 요양보호사 장단점",
    content: "현재 재가에서 일하고 있는데 시설로 옮길까 고민 중이에요. 두 곳 모두 경험해보신 분들의 의견이 궁금합니다.",
    author: "고민중",
    authorRole: "요양보호사",
    category: "직업 고민",
    createdAt: "12시간 전",
    views: 145,
    likes: 31,
    comments: 16,
    tags: ["재가", "시설", "비교"]
  }
];

const categories = [
  { name: '전체', count: 156 },
  { name: '돌봄 노하우', count: 45 },
  { name: '취업 정보', count: 32 },
  { name: '후기 & 경험담', count: 28 },
  { name: '직업 고민', count: 24 },
  { name: '자유게시판', count: 27 }
];

export default function CommunityPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [sortBy, setSortBy] = useState('latest');

  const filteredPosts = mockPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '전체' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case '요양보호사': return 'bg-primary/10 text-primary';
      case '보호자': return 'bg-blue-100 text-blue-600';
      case '구직자': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-text-muted';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header Section */}
      <section className="bg-white border-b border-border-light py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-text-main mb-2">커뮤니티</h1>
              <p className="text-text-secondary">
                요양보호사와 가족들이 함께 소통하는 공간입니다
              </p>
            </div>
            <button className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              글쓰기
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
            <input
              type="text"
              placeholder="궁금한 내용을 검색해보세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Categories */}
            <div className="bg-white rounded-2xl border border-border-light p-6 mb-6">
              <h3 className="font-bold text-text-main mb-4">카테고리</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex justify-between items-center ${
                      selectedCategory === category.name
                        ? 'bg-primary text-white'
                        : 'text-text-muted hover:bg-gray-100 hover:text-text-main'
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className="text-sm">{category.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Tags */}
            <div className="bg-white rounded-2xl border border-border-light p-6">
              <h3 className="font-bold text-text-main mb-4">인기 태그</h3>
              <div className="flex flex-wrap gap-2">
                {['치매', '요양원', '면접', '신입', '재가', '시설', '자격증', '후기'].map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-text-muted px-3 py-1 rounded-full text-sm hover:bg-primary hover:text-white cursor-pointer transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Sort Options */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-text-main">
                {selectedCategory} ({filteredPosts.length})
              </h2>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-border-light rounded-lg text-text-secondary"
              >
                <option value="latest">최신순</option>
                <option value="popular">인기순</option>
                <option value="comments">댓글순</option>
              </select>
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl border border-border-light p-6 hover:shadow-md transition-shadow">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-text-main">{post.author}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleColor(post.authorRole)}`}>
                            {post.authorRole}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-text-muted text-sm">
                          <Clock className="w-3 h-3" />
                          {post.createdAt}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {post.isPinned && (
                        <Pin className="w-4 h-4 text-primary" />
                      )}
                      {post.isHot && (
                        <Fire className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-text-main mb-2 hover:text-primary cursor-pointer">
                      {post.title}
                    </h3>
                    <p className="text-text-secondary line-clamp-2">
                      {post.content}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-text-muted px-2 py-1 rounded text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Post Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-border-light">
                    <div className="flex items-center gap-4 text-text-muted text-sm">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {post.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Heart className="w-4 h-4 text-text-muted hover:text-red-500" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Share2 className="w-4 h-4 text-text-muted" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <button className="border border-primary text-primary px-8 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors font-medium">
                더 많은 게시글 보기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <button className="fixed bottom-6 right-6 bg-primary hover:bg-primary-dark text-white p-4 rounded-full shadow-lg lg:hidden">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}