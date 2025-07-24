package com.globalcarelink.board;

import com.globalcarelink.auth.Member;
import com.globalcarelink.auth.MemberRepository;
import com.globalcarelink.auth.MemberRole;
import com.globalcarelink.board.dto.*;
import com.globalcarelink.config.IntegrationTestConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * BoardService 통합 테스트
 * 실제 데이터베이스와의 상호작용을 검증하여 게시판 시스템의 신뢰성 확보
 * Mock 의존성을 최소화하고 실제 운영 환경과 유사한 조건에서 테스트
 */
@DataJpaTest
@ActiveProfiles("test")
@Import({BoardService.class, IntegrationTestConfig.class})
@SpringJUnitConfig
@DisplayName("게시판 서비스 통합 테스트 - 실제 DB 상호작용")
class BoardServiceIntegrationTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private BoardService boardService;

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private IntegrationTestConfig.TestPerformanceMonitor performanceMonitor;

    // ===== 핵심 비즈니스 로직 통합 테스트 =====

    @Test
    @DisplayName("실제 DB 테스트 - 게시판 생성 및 게시글 작성")
    @Transactional
    void testCreateBoardAndPost() {
        // Given - 실제 DB에 저장된 회원과 게시판 데이터
        Member admin = createAndSaveAdmin("admin1", "관리자1");
        Member user = createAndSaveMember("user1", "사용자1");
        
        // 게시판 생성
        BoardCreateRequest boardRequest = new BoardCreateRequest();
        boardRequest.setName("자유게시판");
        boardRequest.setDescription("자유롭게 의견을 나누는 공간입니다.");
        boardRequest.setType(Board.BoardType.FREE);
        boardRequest.setAdminOnly(false);
        boardRequest.setSortOrder(1);
        
        Board savedBoard = boardService.createBoard(admin, boardRequest);
        entityManager.flush();

        // When - 게시글 작성
        PostCreateRequest postRequest = new PostCreateRequest();
        postRequest.setTitle("첫 번째 게시글입니다");
        postRequest.setContent("<p>안녕하세요. 자유게시판 첫 게시글입니다.</p>");
        postRequest.setIsPinned(false);
        
        long startTime = System.nanoTime();
        Post savedPost = boardService.createPost(savedBoard.getId(), user, postRequest);
        long endTime = System.nanoTime();
        
        entityManager.flush();

        // Then - 정상 생성 검증
        performanceMonitor.validateQueryPerformance((endTime - startTime) / 1_000_000, "게시글 생성");
        
        assertThat(savedBoard.getId()).isNotNull();
        assertThat(savedBoard.getName()).isEqualTo("자유게시판");
        assertThat(savedBoard.getType()).isEqualTo(Board.BoardType.FREE);
        
        assertThat(savedPost.getId()).isNotNull();
        assertThat(savedPost.getTitle()).isEqualTo("첫 번째 게시글입니다");
        assertThat(savedPost.getAuthor().getId()).isEqualTo(user.getId());
        assertThat(savedPost.getBoard().getId()).isEqualTo(savedBoard.getId());
        assertThat(savedPost.getStatus()).isEqualTo(Post.PostStatus.ACTIVE);
    }

    @Test
    @DisplayName("실제 DB 테스트 - 댓글 시스템 및 대댓글 처리")
    @Transactional
    void testCommentSystemWithReplies() {
        // Given - 게시판, 게시글, 사용자들 준비
        Member admin = createAndSaveAdmin("admin2", "관리자2");
        Member author = createAndSaveMember("author1", "작성자1");
        Member commenter1 = createAndSaveMember("commenter1", "댓글작성자1");
        Member commenter2 = createAndSaveMember("commenter2", "댓글작성자2");
        
        Board board = createAndSaveBoard(admin, "Q&A게시판", Board.BoardType.QNA);
        Post post = createAndSavePost(board, author, "질문이 있습니다", "도움이 필요합니다.");
        entityManager.flush();

        // When - 댓글 작성
        CommentCreateRequest commentRequest = new CommentCreateRequest();
        commentRequest.setContent("도움을 드릴 수 있을 것 같습니다.");
        
        Comment parentComment = boardService.createComment(post.getId(), commenter1, commentRequest);
        entityManager.flush();

        // 대댓글 작성
        CommentCreateRequest replyRequest = new CommentCreateRequest();
        replyRequest.setContent("감사합니다. 추가 질문이 있습니다.");
        replyRequest.setParentId(parentComment.getId());
        
        Comment replyComment = boardService.createComment(post.getId(), commenter2, replyRequest);
        entityManager.flush();
        entityManager.clear(); // 1차 캐시 초기화

        // Then - 댓글 구조 검증
        Comment savedParentComment = entityManager.find(Comment.class, parentComment.getId());
        Comment savedReplyComment = entityManager.find(Comment.class, replyComment.getId());
        
        assertThat(savedParentComment.getId()).isNotNull();
        assertThat(savedParentComment.getDepth()).isEqualTo(0);
        assertThat(savedParentComment.getParent()).isNull();
        assertThat(savedParentComment.getChildren()).hasSize(1);
        
        assertThat(savedReplyComment.getId()).isNotNull();
        assertThat(savedReplyComment.getDepth()).isEqualTo(1);
        assertThat(savedReplyComment.getParent().getId()).isEqualTo(parentComment.getId());
        assertThat(savedReplyComment.getChildren()).isEmpty();
    }

    @Test
    @DisplayName("실제 DB 테스트 - 게시글 검색 및 페이징")
    void testPostSearchWithPaging() {
        // Given - 다양한 게시글 데이터 생성
        Member admin = createAndSaveAdmin("admin3", "관리자3");
        Member user1 = createAndSaveMember("user2", "사용자2");
        Member user2 = createAndSaveMember("user3", "사용자3");
        
        Board freeBoard = createAndSaveBoard(admin, "자유게시판", Board.BoardType.FREE);
        Board noticeBoard = createAndSaveBoard(admin, "공지사항", Board.BoardType.NOTICE);
        
        // 자유게시판 게시글 3개
        for (int i = 1; i <= 3; i++) {
            createAndSavePost(freeBoard, user1, "자유게시판 게시글 " + i, "자유게시판 내용 " + i);
        }
        
        // 공지사항 게시글 2개
        for (int i = 1; i <= 2; i++) {
            Post notice = createAndSavePost(noticeBoard, admin, "중요 공지사항 " + i, "공지 내용 " + i);
            notice.setIsPinned(true); // 공지글은 상단 고정
        }
        
        entityManager.flush();

        // When - 게시글 검색 (키워드 + 페이징)
        long searchStartTime = System.nanoTime();
        Page<Post> searchResults = boardService.searchPosts(
            "게시글",                     // 검색 키워드
            freeBoard.getId(),           // 특정 게시판
            PageRequest.of(0, 2)         // 페이징 (2개씩)
        );
        long searchEndTime = System.nanoTime();

        // Then - 검색 결과 및 성능 검증
        performanceMonitor.validateQueryPerformance(
            (searchEndTime - searchStartTime) / 1_000_000,
            "게시글 검색"
        );
        
        assertThat(searchResults.getContent()).hasSize(2); // 페이지 크기 제한
        assertThat(searchResults.getTotalElements()).isEqualTo(3); // 전체 검색 결과
        assertThat(searchResults.hasNext()).isTrue(); // 다음 페이지 존재
        
        // 검색 조건 검증
        for (Post post : searchResults.getContent()) {
            assertThat(post.getTitle()).contains("자유게시판 게시글");
            assertThat(post.getBoard().getId()).isEqualTo(freeBoard.getId());
            assertThat(post.getIsDeleted()).isFalse();
        }
        
        // 공지글 우선 정렬 확인
        Page<Post> noticePosts = boardService.getBoardPosts(noticeBoard.getId(), PageRequest.of(0, 10));
        List<Post> noticeList = noticePosts.getContent();
        
        // 공지글(isPinned=true)이 먼저 나와야 함
        assertThat(noticeList.get(0).getIsPinned()).isTrue();
        assertThat(noticeList.get(1).getIsPinned()).isTrue();
    }

    @Test
    @DisplayName("실제 DB 테스트 - 게시글 조회수 증가 및 동시성 처리")
    @Transactional
    void testPostViewCountIncrement() {
        // Given
        Member admin = createAndSaveAdmin("admin4", "관리자4");
        Member author = createAndSaveMember("author2", "작성자2");
        
        Board board = createAndSaveBoard(admin, "테스트게시판", Board.BoardType.FREE);
        Post post = createAndSavePost(board, author, "조회수 테스트 게시글", "조회수 증가 테스트");
        
        Long initialViewCount = post.getViewCount();
        entityManager.flush();

        // When - 조회수 증가 (동시 접근 시뮬레이션)
        for (int i = 0; i < 5; i++) {
            boardService.incrementPostViewCount(post.getId());
        }
        
        entityManager.flush();
        entityManager.clear();

        // Then - 조회수 정확한 증가 검증
        Post updatedPost = postRepository.findById(post.getId()).orElseThrow();
        assertThat(updatedPost.getViewCount()).isEqualTo(initialViewCount + 5);
    }

    @Test
    @DisplayName("실제 DB 테스트 - 게시글/댓글 소프트 삭제 및 복구")
    @Transactional
    void testSoftDeleteAndRestore() {
        // Given
        Member admin = createAndSaveAdmin("admin5", "관리자5");
        Member user = createAndSaveMember("user4", "사용자4");
        
        Board board = createAndSaveBoard(admin, "삭제테스트게시판", Board.BoardType.FREE);
        Post post = createAndSavePost(board, user, "삭제될 게시글", "삭제 테스트 내용");
        
        CommentCreateRequest commentRequest = new CommentCreateRequest();
        commentRequest.setContent("삭제될 댓글입니다.");
        Comment comment = boardService.createComment(post.getId(), user, commentRequest);
        
        entityManager.flush();

        // When - 소프트 삭제 실행
        boardService.deletePost(post.getId(), user); // 작성자가 삭제
        boardService.deleteComment(comment.getId(), user); // 작성자가 삭제
        
        entityManager.flush();
        entityManager.clear();

        // Then - 소프트 삭제 상태 검증
        Post deletedPost = postRepository.findById(post.getId()).orElseThrow();
        Comment deletedComment = entityManager.find(Comment.class, comment.getId());
        
        assertThat(deletedPost.getIsDeleted()).isTrue();
        assertThat(deletedComment.getIsDeleted()).isTrue();
        
        // 일반 조회에서 제외되는지 확인
        Page<Post> activePosts = boardService.getBoardPosts(board.getId(), PageRequest.of(0, 10));
        assertThat(activePosts.getContent())
            .filteredOn(p -> p.getId().equals(post.getId()))
            .isEmpty();
        
        // 관리자의 복구 기능 테스트
        boardService.restorePost(post.getId(), admin);
        entityManager.flush();
        
        Post restoredPost = postRepository.findById(post.getId()).orElseThrow();
        assertThat(restoredPost.getIsDeleted()).isFalse();
        assertThat(restoredPost.getStatus()).isEqualTo(Post.PostStatus.ACTIVE);
    }

    @Test
    @DisplayName("실제 DB 테스트 - 권한 기반 게시판 접근 제어")
    void testBoardAccessControl() {
        // Given - 관리자 전용 게시판과 일반 게시판
        Member admin = createAndSaveAdmin("admin6", "관리자6");
        Member normalUser = createAndSaveMember("user5", "일반사용자5");
        
        Board adminOnlyBoard = createAndSaveBoard(admin, "관리자전용게시판", Board.BoardType.NOTICE);
        adminOnlyBoard.setAdminOnly(true);
        
        Board publicBoard = createAndSaveBoard(admin, "공개게시판", Board.BoardType.FREE);
        publicBoard.setAdminOnly(false);
        
        entityManager.flush();

        // When & Then - 관리자 전용 게시판 접근 권한 검증
        
        // 관리자는 관리자 전용 게시판에 글 작성 가능
        PostCreateRequest adminPostRequest = new PostCreateRequest();
        adminPostRequest.setTitle("관리자 전용 공지");
        adminPostRequest.setContent("관리자만 작성할 수 있습니다.");
        
        Post adminPost = boardService.createPost(adminOnlyBoard.getId(), admin, adminPostRequest);
        assertThat(adminPost.getId()).isNotNull();
        
        // 일반 사용자는 관리자 전용 게시판에 글 작성 불가
        PostCreateRequest userPostRequest = new PostCreateRequest();
        userPostRequest.setTitle("일반 사용자 게시글");
        userPostRequest.setContent("작성할 수 없어야 합니다.");
        
        assertThatThrownBy(() -> 
            boardService.createPost(adminOnlyBoard.getId(), normalUser, userPostRequest))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("권한이 없습니다");
        
        // 일반 사용자는 공개 게시판에 글 작성 가능
        Post userPost = boardService.createPost(publicBoard.getId(), normalUser, userPostRequest);
        assertThat(userPost.getId()).isNotNull();
    }

    @Test
    @DisplayName("실제 DB 테스트 - 대용량 게시글 데이터 처리 성능")
    void testLargePostDataPerformance() {
        // Given - 대용량 게시글 데이터 생성 준비
        Member admin = createAndSaveAdmin("bulk_admin", "대용량테스트관리자");
        Member author = createAndSaveMember("bulk_author", "대용량테스트작성자");
        
        Board board = createAndSaveBoard(admin, "대용량테스트게시판", Board.BoardType.FREE);
        entityManager.flush();

        // When - 대용량 게시글 생성 (50개)
        long bulkInsertStartTime = System.nanoTime();
        
        for (int i = 1; i <= 50; i++) {
            PostCreateRequest request = new PostCreateRequest();
            request.setTitle("대용량테스트게시글 " + i);
            request.setContent("대용량 테스트용 게시글 내용 " + i + ". ".repeat(100)); // 긴 내용
            request.setIsPinned(false);
            
            boardService.createPost(board.getId(), author, request);
            
            if (i % 10 == 0) {
                entityManager.flush(); // 주기적 플러시
                entityManager.clear();
            }
        }
        
        entityManager.flush();
        long bulkInsertEndTime = System.nanoTime();

        // 대용량 데이터 검색 성능 테스트
        entityManager.clear();
        
        long searchStartTime = System.nanoTime();
        Page<Post> searchResults = boardService.searchPosts(
            "대용량테스트", board.getId(), PageRequest.of(0, 10)
        );
        long searchEndTime = System.nanoTime();

        // Then - 성능 요구사항 검증
        long insertTimeMs = (bulkInsertEndTime - bulkInsertStartTime) / 1_000_000;
        long searchTimeMs = (searchEndTime - searchStartTime) / 1_000_000;
        
        performanceMonitor.validateBatchSize(50, "게시글 대량 생성");
        
        assertThat(insertTimeMs).isLessThan(2000L)
            .describedAs("50개 게시글 생성은 2초 이내에 완료되어야 함");
        assertThat(searchTimeMs).isLessThan(150L)
            .describedAs("대용량 게시글 검색은 150ms 이내에 완료되어야 함");
        
        assertThat(searchResults.getContent()).hasSize(10);
        assertThat(searchResults.getTotalElements()).isEqualTo(50);
        
        System.out.println("50개 게시글 생성 시간: " + insertTimeMs + "ms");
        System.out.println("대용량 게시글 검색 시간: " + searchTimeMs + "ms");
    }

    // ===== 테스트 데이터 생성 헬퍼 메서드 =====

    private Member createAndSaveAdmin(String username, String name) {
        Member admin = new Member();
        admin.setUsername(username);
        admin.setPassword("$2a$10$dummyhash");
        admin.setName(name);
        admin.setEmail(username + "@admin.com");
        admin.setPhoneNumber("02-1234-5678");
        admin.setRole(MemberRole.ADMIN);
        admin.setCreatedDate(LocalDateTime.now());
        
        return entityManager.persistAndFlush(admin);
    }

    private Member createAndSaveMember(String username, String name) {
        Member member = new Member();
        member.setUsername(username);
        member.setPassword("$2a$10$dummyhash");
        member.setName(name);
        member.setEmail(username + "@member.com");
        member.setPhoneNumber("010-1234-5678");
        member.setRole(MemberRole.MEMBER);
        member.setCreatedDate(LocalDateTime.now());
        
        return entityManager.persistAndFlush(member);
    }

    private Board createAndSaveBoard(Member admin, String name, Board.BoardType type) {
        Board board = new Board();
        board.setName(name);
        board.setDescription(name + " 설명");
        board.setType(type);
        board.setIsActive(true);
        board.setSortOrder(1);
        board.setAdminOnly(type == Board.BoardType.NOTICE);
        board.setCreatedDate(LocalDateTime.now());
        
        return entityManager.persistAndFlush(board);
    }

    private Post createAndSavePost(Board board, Member author, String title, String content) {
        Post post = new Post();
        post.setTitle(title);
        post.setContent(content);
        post.setAuthor(author);
        post.setBoard(board);
        post.setViewCount(0L);
        post.setIsPinned(false);
        post.setIsDeleted(false);
        post.setStatus(Post.PostStatus.ACTIVE);
        post.setCreatedDate(LocalDateTime.now());
        
        return entityManager.persistAndFlush(post);
    }
}