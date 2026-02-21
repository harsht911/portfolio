import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native-web';

const CodeBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const codeSnippets = [
      'class MainActivity : AppCompatActivity()',
      'fun onCreate(savedInstanceState: Bundle?)',
      '@Composable fun App()',
      'viewModel.collect { }',
      'suspend fun fetchData()',
      'implementation "androidx.compose"',
      'sealed class UiState',
      'data class User(val name: String)',
      'LazyColumn { }',
      'val scope = rememberCoroutineScope()',
      'MutableStateFlow<State>',
      'Room Database',
      'Retrofit.Builder()',
      'NavHost(navController)',
      'build.gradle.kts',
      'ViewModel',
      'LiveData',
      'Flow',
      '{ }',
      '< />',
      '=>',
    ];

    const androidSymbols = ['⚡', '📱', '🤖', '⚙️', '🔧', '💚', '▶', '{}', '<>', '[]'];

    class CodeParticle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.text = Math.random() > 0.3 
          ? codeSnippets[Math.floor(Math.random() * codeSnippets.length)]
          : androidSymbols[Math.floor(Math.random() * androidSymbols.length)];
        this.fontSize = Math.random() > 0.5 ? 14 : 12;
        this.speed = 0.2 + Math.random() * 0.5;
        this.opacity = 0.05 + Math.random() * 0.15;
        this.drift = (Math.random() - 0.5) * 0.5;
      }

      update() {
        this.y += this.speed;
        this.x += this.drift;
        
        if (this.y > canvas.height + 50) {
          this.y = -50;
          this.x = Math.random() * canvas.width;
        }
        if (this.x < -100) this.x = canvas.width + 100;
        if (this.x > canvas.width + 100) this.x = -100;
      }

      draw() {
        ctx.save();
        ctx.font = `${this.fontSize}px 'Courier New', monospace`;
        ctx.fillStyle = `rgba(63, 185, 80, ${this.opacity})`;
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
      }
    }

    const particles = Array.from({ length: 80 }, () => new CodeParticle());

    const animate = () => {
      ctx.fillStyle = '#0D1117';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <View style={styles.container}>
      <canvas ref={canvasRef} style={styles.canvas} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    pointerEvents: 'none'
  },
  canvas: {
    width: '100%',
    height: '100%'
  }
});

export default CodeBackground;
