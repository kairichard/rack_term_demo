# Run this file with:
#
#   bundle exec RAILS_ENV=production rackup -p 3000 -s thin
#
# And access:
#
#   http://localhost:3000/hello/world
#
# We are using Bundler in this example, but we could also
# have used rubygems:
#
#   require "rubygems"
#
#   gem "actionpack"
#   gem "railties"
#
#   require "rails"
#   require "rails/all"
# The following lines should come as no surprise. Except by
# ActionController::Metal, it follows the same structure of
# config/application.rb, config/environment.rb and config.ru
# existing in any Rails 3 app. Here they are simply in one
# file and without the comments.
$stdout.sync = true

require 'thin'
require "rails"
require "rails/all"
require 'rack/websocket'
require 'faye'

class ClientAuth
  def outgoing(message, callback)
    # Again, leave non-subscribe messages alone
    unless message['channel'] == '/meta/subscribe'
      return callback.call(message)
    end

    # Add ext field if it's not present
    message['ext'] ||= {}

    # Set the auth token
    message['ext']['authToken'] = 'rt6utrb'

    # Carry on and send the message to the server
    callback.call(message)
  end
  def incoming(message,callback)
    callback.call(message)
  end
end
class MyApp < Rails::Application
  routes.append do
    match "/command/dispatch" => "Commander#dispatch"
  end

  # Enable cache classes. Production style.
  config.cache_classes = true

  # Here you could remove some middlewares, for example
  # Rack::Lock, AD::Flash and AD::BestStandardsSupport below.
  # The remaining stack is printed on rackup (for fun!).
  # Rails 4 will have config.middleware.api_only! to get
  # rid of browser related middleware.
  config.middleware.delete "Rack::Lock"
  config.middleware.delete "ActionDispatch::Flash"
  config.middleware.delete "ActionDispatch::BestStandardsSupport"
  config.middleware.delete "Rails::Rack::Logger"
  # config.middleware.swap   "ActionDispatch::Static",Rack::Static, urls: ["/stylesheets", "/images"], root: Dir.pwd+"/public"
  config.middleware.use Faye::RackAdapter, :mount      => '/socket',
                       :timeout    => 125,
                       :extensions => [ClientAuth.new]

  
  # We need a secret token for session, cookies, etc.
  config.secret_token = "asodjoaishdoh23iuhe387zr8723hf87wehf32847ghfivudkhfijlkofdpq29u104u9120340ur32r98u32987z4t234e3r2ewfus9ghersioe"
end


MyApp.initialize!

# Print the stack for fun!
puts ">> Starting Rails lightweight"
Rails.configuration.middleware.each do |middleware|
  puts "use #{middleware.inspect}"
end
puts "run #{Rails.application.class.name}.routes"

# Run it (originally in config.ru)

# map '/socket' do 
#   run App
# end
map '/' do 
  run MyApp
end

