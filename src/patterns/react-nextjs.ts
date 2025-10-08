import type { AnalysisPattern } from '../types/index.js'

/**
 * Patrones específicos para React y Next.js
 */

export const reactPatterns: AnalysisPattern[] = [
    // Componentes grandes
    {
        pattern: /export\s+default\s+function\s+\w+\([^)]*\)\s*{[\s\S]{300,}}/g,
        issue: 'Componente muy grande (>300 líneas)',
        recommendation:
            'Aplica el patrón Composite y divide en componentes más pequeños',
        severity: 'high',
        explanation:
            'Componentes grandes son difíciles de mantener y testear. Aplica composición.',
        designPattern: 'Composite Pattern',
        codeExample: `// ❌ Mal - Componente grande
function UserDashboard() {
  // 300+ líneas de código...
  return (
    <div>
      {/* Mucho JSX mezclado */}
    </div>
  );
}

// ✅ Bien - Componentes pequeños
function UserDashboard() {
  return (
    <div>
      <UserHeader />
      <UserStats />
      <UserContent />
      <UserFooter />
    </div>
  );
}

function UserHeader() {
  return <header>...</header>;
}

function UserStats() {
  return <section>...</section>;
}`,
    },

    // Múltiples useState
    {
        pattern:
            /useState\([^)]*\)[\s\S]{0,100}useState\([^)]*\)[\s\S]{0,100}useState/g,
        issue: 'Múltiples useState relacionados',
        recommendation:
            'Considera useReducer o un hook personalizado (Facade Pattern)',
        severity: 'medium',
        explanation:
            'Múltiples estados relacionados indican necesidad de un reducer o estado consolidado.',
        designPattern: 'Facade Pattern / State Pattern',
        codeExample: `// ❌ Mal - Estados dispersos
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [data, setData] = useState(null);

// ✅ Bien - Estado consolidado
const [state, dispatch] = useReducer(reducer, {
  loading: false,
  error: null,
  data: null
});

// Mejor aún - Custom Hook (Facade)
const { data, loading, error } = useUserData(userId);`,
    },

    // Objetos inline como props
    {
        pattern: /<[A-Z][^>]*\s+\w+={{[^}]+}}/g,
        issue: 'Objeto inline como prop',
        recommendation:
            'Usa useMemo para evitar re-renders innecesarios (Memoization)',
        severity: 'high',
        explanation:
            'Objetos inline crean nuevas referencias en cada render, causando re-renders.',
        codeExample: `// ❌ Mal
<Component config={{ theme: 'dark', size: 'lg' }} />

// ✅ Bien
const config = useMemo(() => ({ theme: 'dark', size: 'lg' }), []);
<Component config={config} />`,
    },

    // Funciones inline en listas
    {
        pattern: /\.map\([^)]*=>\s*<[^>]+onClick={[^}]*=>/g,
        issue: 'Función inline en map',
        recommendation:
            'Usa useCallback para funciones en listas (Command Pattern)',
        severity: 'high',
        designPattern: 'Command Pattern',
        codeExample: `// ❌ Mal
{items.map(item => (
  <Item onClick={() => handleClick(item.id)} />
))}

// ✅ Bien
const handleItemClick = useCallback((id: string) => {
  handleClick(id);
}, [handleClick]);

{items.map(item => (
  <Item onClick={() => handleItemClick(item.id)} />
))}`,
    },

    // Props drilling
    {
        pattern: /function\s+\w+\([^)]*{\s*\w+,\s*\w+,\s*\w+,\s*\w+[^}]*}/g,
        issue: 'Posible props drilling detectado',
        recommendation: 'Considera usar Context API o un estado global',
        severity: 'medium',
        explanation:
            'Pasar muchas props sugiere que hay información que debería estar en un contexto compartido.',
        designPattern: 'Context Pattern',
        codeExample: `// ❌ Mal - Props drilling
function App() {
  const [user, setUser] = useState(null);
  return <Dashboard user={user} setUser={setUser} />;
}

function Dashboard({ user, setUser }) {
  return <Sidebar user={user} setUser={setUser} />;
}

function Sidebar({ user, setUser }) {
  return <UserMenu user={user} setUser={setUser} />;
}

// ✅ Bien - Context
const UserContext = createContext();

function App() {
  const [user, setUser] = useState(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Dashboard />
    </UserContext.Provider>
  );
}

function UserMenu() {
  const { user, setUser } = useContext(UserContext);
  return <div>...</div>;
}`,
    },

    // useEffect sin dependencias
    {
        pattern: /useEffect\([^,]+,\s*\[\]\s*\)/g,
        issue: 'useEffect con array de dependencias vacío',
        recommendation:
            'Verifica si realmente no tiene dependencias o considera useMemo/useCallback',
        severity: 'low',
        explanation:
            'Los effects con dependencias vacías solo se ejecutan al montar. Asegúrate de que sea intencional.',
    },

    // Key props faltantes
    {
        pattern: /\.map\([^)]*=>\s*<[^>]*(?!.*key=)/g,
        issue: 'Falta prop "key" en elementos de lista',
        recommendation: 'Agrega una prop "key" única para cada elemento',
        severity: 'medium',
        explanation:
            'React necesita la prop "key" para optimizar el renderizado de listas.',
        codeExample: `// ❌ Mal
{users.map(user => (
  <UserCard user={user} />
))}

// ✅ Bien
{users.map(user => (
  <UserCard key={user.id} user={user} />
))}`,
    },

    // Conditional rendering complejo
    {
        pattern: /{\s*\w+\s*\?\s*\w+\s*\?\s*.*:\s*.*:\s*.*}/g,
        issue: 'Renderizado condicional complejo',
        recommendation:
            'Extrae la lógica condicional a una función o componente',
        severity: 'medium',
        explanation:
            'Los ternarios anidados son difíciles de leer. Es mejor extraer la lógica.',
        codeExample: `// ❌ Mal
{isLoading ?
  <Spinner /> :
  hasError ?
    <ErrorMessage /> :
    hasData ?
      <DataView data={data} /> :
      <EmptyState />
}

// ✅ Bien
function ContentRenderer({ isLoading, hasError, hasData, data }) {
  if (isLoading) return <Spinner />;
  if (hasError) return <ErrorMessage />;
  if (hasData) return <DataView data={data} />;
  return <EmptyState />;
}

// En el componente
<ContentRenderer
  isLoading={isLoading}
  hasError={hasError}
  hasData={hasData}
  data={data}
/>`,
    },
]

export const nextjsPatterns: AnalysisPattern[] = [
    // getServerSideProps con lógica compleja
    {
        pattern: /export\s+async\s+function\s+getServerSideProps[\s\S]{200,}/g,
        issue: 'getServerSideProps con lógica compleja',
        recommendation:
            'Extrae la lógica a servicios separados para mejor testeo',
        severity: 'medium',
        explanation:
            'Las funciones de Next.js deben ser simples y delegar la lógica compleja a servicios.',
        codeExample: `// ❌ Mal
export async function getServerSideProps(context) {
  // 200+ líneas de lógica compleja...
  const data = await fetch('...');
  const processed = await processData(data);
  const enriched = await enrichData(processed);

  return { props: { enriched } };
}

// ✅ Bien
export async function getServerSideProps(context) {
  const dataService = new DataService();
  const data = await dataService.getPageData(context.params);

  return { props: { data } };
}`,
    },

    // API routes sin manejo de errores
    {
        pattern:
            /export\s+default\s+(?:async\s+)?function\s+handler\([^)]*\)\s*{[^}]*(?!.*try.*catch)[^}]*}/gs,
        issue: 'API route sin manejo de errores',
        recommendation: 'Agrega try/catch y manejo apropiado de errores HTTP',
        severity: 'high',
        explanation:
            'Las API routes deben manejar errores graciosamente y retornar códigos HTTP apropiados.',
        codeExample: `// ❌ Mal
export default async function handler(req, res) {
  const data = await someOperation();
  res.json(data);
}

// ✅ Bien
export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const data = await someOperation();
    res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}`,
    },

    // Importaciones dinámicas sin lazy loading
    {
        pattern: /import\([^)]+\)(?!.*lazy)/g,
        issue: 'Importación dinámica sin lazy loading',
        recommendation: 'Considera usar React.lazy() para componentes grandes',
        severity: 'low',
        explanation:
            'React.lazy() proporciona mejor integración con Suspense para componentes pesados.',
        codeExample: `// ❌ Regular
const HeavyComponent = dynamic(() => import('./HeavyComponent'));

// ✅ Mejor para componentes grandes
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}`,
    },
]

export const performancePatterns: AnalysisPattern[] = [
    // Imágenes sin optimización
    {
        pattern: /<img\s+[^>]*src=["'][^"']*["'][^>]*(?!.*priority|.*loading)/g,
        issue: 'Imagen sin optimización de Next.js',
        recommendation: 'Usa next/image para optimización automática',
        severity: 'medium',
        explanation:
            'next/image proporciona optimización automática, lazy loading y mejores métricas de rendimiento.',
        codeExample: `// ❌ Mal
<img src="/photo.jpg" alt="Photo" />

// ✅ Bien
import Image from 'next/image';

<Image
  src="/photo.jpg"
  alt="Photo"
  width={500}
  height={300}
  priority // Para imágenes above-the-fold
/>`,
    },

    // Fuentes sin optimización
    {
        pattern: /@import\s+url\(['"]https:\/\/fonts\.googleapis\.com/g,
        issue: 'Fuentes de Google sin optimización',
        recommendation: 'Usa next/font para optimización automática de fuentes',
        severity: 'medium',
        explanation:
            'next/font optimiza las fuentes eliminando solicitudes de red adicionales.',
        codeExample: `// ❌ Mal
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

// ✅ Bien
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function Layout({ children }) {
  return (
    <html className={inter.className}>
      <body>{children}</body>
    </html>
  );
}`,
    },
]
