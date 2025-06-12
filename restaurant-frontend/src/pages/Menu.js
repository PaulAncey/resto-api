import React, { useState, useEffect, useCallback } from 'react';
import { menuService } from '../services/api';
import { UtensilsCrossed, Clock } from 'lucide-react';

const Menu = () => {
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const loadMenu = useCallback(async () => {
    // Éviter les appels multiples
    if (!isFirstLoad && menuData.length > 0) {
      console.log('Menu déjà chargé, pas de nouvel appel API');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Chargement du menu depuis l\'API...');
      const data = await menuService.getMenu();
      
      console.log('📦 Données menu reçues:', data);
      
      // Filtrer et nettoyer les données pour éviter les doublons
      const cleanedData = data.filter((category, index, self) => 
        index === self.findIndex(c => c.id === category.id)
      ).map(category => ({
        ...category,
        items: category.items || []
      }));
      
      console.log('✅ Données menu nettoyées:', cleanedData);
      setMenuData(cleanedData);
      setIsFirstLoad(false);
    } catch (error) {
      console.error('❌ Erreur lors du chargement du menu:', error);
      setError('Impossible de charger le menu. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, [isFirstLoad, menuData.length]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchMenu = async () => {
      if (isMounted) {
        await loadMenu();
      }
    };
    
    fetchMenu();
    
    return () => {
      isMounted = false;
    };
  }, [loadMenu]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const debugMenu = async () => {
    try {
      const data = await menuService.getMenu();
      console.log('Données brutes du menu:', data);
      alert(`Nombre de catégories reçues: ${data.length}\nDonnées dans la console`);
    } catch (error) {
      console.error('Erreur debug:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={loadMenu}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              Réessayer
            </button>
            <button
              onClick={debugMenu}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Debug Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <UtensilsCrossed className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Notre Menu</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Découvrez nos plats préparés avec passion par nos chefs. 
            Une carte qui met à l'honneur les saveurs authentiques et les produits de saison.
          </p>
        </div>
      </section>

      {/* Menu Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {menuData.length === 0 ? (
            <div className="text-center py-12">
              <UtensilsCrossed className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Menu en cours de préparation
              </h3>
              <p className="text-gray-500">
                Notre équipe travaille actuellement sur de délicieux plats pour vous !
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {menuData.map((category) => (
                <div key={category.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  {/* Category Header */}
                  <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      {category.name}
                    </h2>
                  </div>

                  {/* Category Items */}
                  <div className="p-6">
                    {category.items && category.items.length > 0 ? (
                      <div className="grid gap-6">
                        {category.items.map((item) => (
                          <div key={item.id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="text-lg md:text-xl font-semibold text-gray-800">
                                    {item.name}
                                  </h3>
                                  <span className="text-lg md:text-xl font-bold text-green-600 ml-4">
                                    {formatPrice(item.price)}
                                  </span>
                                </div>
                                
                                {item.description && (
                                  <p className="text-gray-600 leading-relaxed">
                                    {item.description}
                                  </p>
                                )}

                                {item.image_url && (
                                  <div className="mt-4">
                                    <img
                                      src={item.image_url}
                                      alt={item.name}
                                      className="w-full max-w-md h-48 object-cover rounded-lg"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">
                          Cette catégorie sera bientôt disponible
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer Info */}
      <section className="bg-white py-12 border-t">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Informations importantes
          </h3>
          <div className="max-w-3xl mx-auto space-y-4 text-gray-600">
            <p>
              <strong>Allergènes :</strong> Nos plats peuvent contenir des allergènes. 
              N'hésitez pas à nous signaler vos allergies lors de votre réservation.
            </p>
            <p>
              <strong>Menu végétarien et végan :</strong> Des options végétariennes et véganes 
              sont disponibles sur demande.
            </p>
            <p>
              <strong>Prix :</strong> Les prix peuvent varier selon la saison et la disponibilité des produits. 
              Menu mis à jour régulièrement.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Menu;