import '../pages/StoresPage.css';
export default function HomePage() {
  return (
    <div >
      {/* <h1 className="text-3xl font-bold text-gray-700">Store</h1> */}

      <div class="location-section">
        <div class="image-section">
            <img src="/img/store1.png" alt="Soumaki Phu My Hung Interior"/>
        </div>
        
        <div class="info-section">
            <h1 class="brand-name">Soumaki</h1>
            <h2 class="location-name">Phu My Hung</h2>
            
            <div class="find-us">FIND US</div>
            <p class="address">
                S27-1, Sky Garden 1, Tan Hung, Ho Chi Minh City (District 7)
            </p>
            
            <div class="opening-hours-title">OPENING HOURS</div>
            <p class="hours">
                10 A.M – 9 P.M (every day)
            </p>
        </div>
    </div>

    
    <div class="location-section">
        <div class="info-section">
            <h1 class="brand-name">Soumaki</h1>
            <h2 class="location-name">Ly Tu Trong</h2>
            
            <div class="find-us">FIND US</div>
            <p class="address">
                42 Ly Tu Trong, Sai Gon, Ho Chi Minh City (District 1)
            </p>
            
            <div class="opening-hours-title">OPENING HOURS</div>
            <p class="hours">
                10 A.M – 9 P.M (every day)
            </p>
        </div>
        
        <div class="image-section">
            <img src="/img/store2.jpg" alt="Soumaki Ly Tu Trong Storefront"/>
        </div>
    </div>


    <div class="location-section">
        <div class="image-section">
            <img src="/img/store3.jpg" alt="Soumaki Phu My Hung Interior"/>
        </div>
        
        <div class="info-section">
            <h1 class="brand-name">Soumaki</h1>
            <h2 class="location-name">Phu My Hung</h2>
            
            <div class="find-us">FIND US</div>
            <p class="address">
                S27-1, Sky Garden 1, Tan Hung, Ho Chi Minh City (District 7)
            </p>
            
            <div class="opening-hours-title">OPENING HOURS</div>
            <p class="hours">
                10 A.M – 9 P.M (every day)
            </p>
        </div>
    </div>
    
    </div>
  );
}
