/**
 * Lucide React 아이콘 중앙 관리
 * Tree-shaking 최적화를 위한 Named Import 방식
 * 
 * 빌드 에러 방지를 위해 프로젝트에서 사용하는 모든 아이콘을 포함
 * 프로젝트 규모가 커질수록 사용하는 아이콘이 많아지므로,
 * 자주 사용되는 아이콘들을 미리 포함하여 빌드 에러를 방지
 */

// 프로젝트에서 사용되는 모든 아이콘을 Named Import로 통합
export {
  // 네비게이션 & 컨트롤
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Home,
  Menu,
  MoreVertical,
  Navigation,
  X,

  // 사용자 & 인증
  User,
  UserCheck,
  Users,
  UserX,
  LogIn,
  LogOut,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,

  // 커뮤니케이션
  Mail,
  Phone,
  MessageCircle,
  MessageSquare,
  Send,
  Reply,

  // 상태 & 피드백
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  Check,
  XCircle,
  Info,
  HelpCircle,
  Loader2,
  RefreshCw,

  // 액션 & 편집
  Edit,
  Edit3,
  Save,
  Download,
  Upload,
  Trash2,
  Plus,
  Search,
  Filter,
  Settings,

  // 미디어 & 콘텐츠
  Image,
  Camera,
  FileText,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,

  // 위치 & 지도
  MapPin,
  Globe,
  Building2,
  Hospital,
  Bus,
  Car,
  Coffee,
  ShoppingCart,

  // 시간 & 일정
  Clock,
  Calendar,

  // 기술 & 시스템
  Wifi,
  Smartphone,
  Monitor,
  Activity,
  BarChart3,
  TrendingUp,
  Target,
  Award,
  Sparkles,

  // 테마 & UI
  Sun,
  Moon,
  Grid,
  List,
  PanelLeftClose,
  PanelLeftOpen,

  // 건강 & 의료
  Stethoscope,
  Brain,
  Shield,

  // 비즈니스
  Briefcase,
  CreditCard,
  DollarSign,
  Tag,

  // 미디어 컨트롤
  Play,
  Pause,
  Volume2,
  VolumeX,

  // 기타 자주 사용되는 아이콘들
  Bell,
  Flag,
  Pin,
  Lightbulb,
  Bath,
  Utensils,
  Megaphone,
  ExternalLink,
  SortDesc
} from 'lucide-react';

// 타입 정의를 위한 Icon 컴포넌트 타입
export type { LucideIcon } from 'lucide-react';